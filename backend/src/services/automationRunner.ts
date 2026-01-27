import { IAutomation, FlowNode } from "../types";
import AutomationTestRun from "../models/AutomationTestRun";
import { sendEmail } from "../utils/mailer";
import {
  sleep,
  convertToMilliseconds,
  calculateDelayUntil,
} from "../utils/sleep";
import { evaluateCondition, ConditionRule } from "../utils/conditionEvaluator";
import { logNodeExecution } from "../utils/executionLogger";
import { checkExecutionLimits, GuardStats } from "../utils/executionGuards";

interface NodeData {
  message?: string;
  delayType?: "absolute" | "relative";
  absoluteDate?: string;
  relativeValue?: number;
  relativeUnit?: "minutes" | "hours" | "days";
  rules?: ConditionRule[];
  [key: string]: any;
}

interface ExecutionNode extends Omit<FlowNode, "data"> {
  data?: NodeData;
}

/**
 * Executes the core logic for an action node
 */
const executeActionNodeLogic = async (
  node: ExecutionNode,
  email: string,
): Promise<string> => {
  const message = node.data?.message || "No message provided";

  console.log(`📧 Executing action node: ${node.id}`);
  console.log(`   Sending to: ${email}`);

  await sendEmail(email, "Automation Test", message);
  return `Email sent successfully to ${email}`;
};

/**
 * Executes the core logic for a delay node
 * Returns the amount of time waited in MS
 */
const executeDelayNodeLogic = async (
  node: ExecutionNode,
): Promise<{ message: string; delayMs: number }> => {
  const delayType = node.data?.delayType;

  if (delayType === "absolute") {
    const absoluteDate = node.data?.absoluteDate;
    if (!absoluteDate) throw new Error("Absolute date not provided");

    const targetDate = new Date(absoluteDate);
    const delayMs = calculateDelayUntil(targetDate);
    await sleep(delayMs);
    return {
      message: `Wait until ${targetDate.toISOString()} completed`,
      delayMs,
    };
  } else if (delayType === "relative") {
    const value = node.data?.relativeValue;
    const unit = node.data?.relativeUnit;
    if (!value || !unit)
      throw new Error("Relative delay value or unit not provided");

    const delayMs = convertToMilliseconds(value, unit);
    await sleep(delayMs);
    return {
      message: `Wait for ${value} ${unit} completed`,
      delayMs,
    };
  } else {
    throw new Error(`Unknown delay type: ${delayType}`);
  }
};

/**
 * Helper to determine condition result and next node
 */
const handleConditionNode = (
  automation: IAutomation,
  node: ExecutionNode,
  email: string,
) => {
  const rules = node.data?.rules || [];
  const result = evaluateCondition(rules, email);
  const targetLabel = result ? "TRUE" : "FALSE";

  const edge = automation.edges.find(
    (e) =>
      e.source === node.id &&
      String((e as any).label).toUpperCase() === targetLabel,
  );

  if (!edge) {
    console.error(
      `[Flow Debug] Available edges from this node:`,
      automation.edges
        .filter((e) => e.source === node.id)
        .map((e) => ({ id: e.id, label: (e as any).label })),
    );
    throw new Error(
      `${targetLabel} edge is missing for condition node ${node.id}`,
    );
  }

  const nextNode = automation.nodes.find((n) => n.id === edge.target);
  if (!nextNode)
    throw new Error(
      `Target node ${edge.target} not found for branch ${targetLabel}`,
    );

  return {
    result,
    nextNode: nextNode as ExecutionNode,
    message: `Condition evaluated to ${targetLabel}`,
  };
};

/**
 * Main automation runner with Safeguards and Summary (Phases 6 & 7)
 */
export const runAutomation = async (
  automation: IAutomation,
  email: string,
  testRunId: string,
): Promise<void> => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `🔄 Running automation: ${automation.name} (Safeguards - Phase 6/7)`,
  );
  console.log(`📧 Email: ${email}`);
  console.log(`🆔 Test Run ID: ${testRunId}`);
  console.log(`${"=".repeat(60)}\n`);

  const automationId = automation._id.toString();
  const stats: GuardStats = { stepCount: 0, totalDelayMs: 0 };

  try {
    const { nodes, edges } = automation;
    let currentNode = nodes.find((n) => n.type === "start") as ExecutionNode;

    if (!currentNode) throw new Error("Start node not found");

    while (currentNode) {
      // Phase 6: Check execution limits before proceeding
      const guardCheck = checkExecutionLimits(stats);
      if (!guardCheck.allowed) {
        throw new Error(guardCheck.reason);
      }

      stats.stepCount++;

      // 1) Update Test Run currentStep
      await AutomationTestRun.findByIdAndUpdate(testRunId, {
        currentStep: currentNode.id,
      });

      // 2) Create "started" log entry
      let startMessage = `Executing ${currentNode.type} node`;
      if (currentNode.type === "action") startMessage = "Sending email";
      if (currentNode.type === "delay") {
        const d = currentNode.data;
        startMessage =
          d?.delayType === "relative"
            ? `Waiting for ${d.relativeValue} ${d.relativeUnit}`
            : `Waiting until ${d?.absoluteDate}`;
      }

      const log = await logNodeExecution({
        testRunId,
        automationId,
        nodeId: currentNode.id,
        nodeType: currentNode.type as any,
        status: "started",
        message: startMessage,
      });

      const logId = log?._id.toString();
      let successMessage = `Node ${currentNode.id} completed`;
      let nextNode: ExecutionNode | null = null;

      try {
        // 3) Execute node logic
        switch (currentNode.type) {
          case "start":
            successMessage = "Automation started";
            const startEdge = edges.find((e) => e.source === currentNode.id);
            nextNode =
              (nodes.find(
                (n) => n.id === startEdge?.target,
              ) as ExecutionNode) || null;
            break;

          case "action":
            successMessage = await executeActionNodeLogic(currentNode, email);
            const actionEdge = edges.find((e) => e.source === currentNode.id);
            nextNode =
              (nodes.find(
                (n) => n.id === actionEdge?.target,
              ) as ExecutionNode) || null;
            break;

          case "delay":
            // Phase 6: Pre-check delay limit
            let tempDelay = 0;
            if (currentNode.data?.delayType === "relative") {
              const val = currentNode.data.relativeValue ?? 0;
              const unit = currentNode.data.relativeUnit ?? "minutes";
              tempDelay = convertToMilliseconds(val, unit);
            } else if (currentNode.data?.absoluteDate) {
              tempDelay = calculateDelayUntil(
                new Date(currentNode.data.absoluteDate),
              );
            }

            const delayCheck = checkExecutionLimits(stats, tempDelay);
            if (!delayCheck.allowed) throw new Error(delayCheck.reason);

            const delayResult = await executeDelayNodeLogic(currentNode);
            successMessage = delayResult.message;
            stats.totalDelayMs += delayResult.delayMs;

            const delayEdge = edges.find((e) => e.source === currentNode.id);
            nextNode =
              (nodes.find(
                (n) => n.id === delayEdge?.target,
              ) as ExecutionNode) || null;
            break;

          case "condition":
            const condResult = handleConditionNode(
              automation,
              currentNode,
              email,
            );
            successMessage = condResult.message;
            nextNode = condResult.nextNode;
            break;

          case "end":
            successMessage = "Reached end node";
            nextNode = null;
            break;

          default:
            console.log(`⚠️ Unknown node type: ${currentNode.type}`);
            nextNode = null;
        }

        // 4) Update log to "completed"
        if (logId) {
          await logNodeExecution({
            testRunId,
            automationId,
            nodeId: currentNode.id,
            nodeType: currentNode.type as any,
            status: "completed",
            message: successMessage,
            logId,
          });
        }

        if (currentNode.type === "end") break;
        currentNode = nextNode!;
        if (!currentNode) break;
      } catch (nodeError) {
        // 5) Update log to "failed" on node error
        const nodeErrorMessage =
          nodeError instanceof Error
            ? nodeError.message
            : "Node execution failed";
        if (logId) {
          await logNodeExecution({
            testRunId,
            automationId,
            nodeId: currentNode.id,
            nodeType: currentNode.type as any,
            status: "failed",
            message: nodeErrorMessage,
            logId,
          });
        }
        throw nodeError; // Re-throw to handle automation failure
      }
    }

    // Phase 7: Save summary on completion
    await AutomationTestRun.findByIdAndUpdate(testRunId, {
      status: "completed",
      finishedAt: new Date(),
      currentStep: "end",
      summary: {
        totalStepsExecuted: stats.stepCount,
        totalDelayTimeMs: stats.totalDelayMs,
      },
    });

    console.log(`\n✅ Automation completed successfully\n`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n❌ Automation failed: ${errorMessage}\n`);

    // Phase 7: Save summary on failure
    await AutomationTestRun.findByIdAndUpdate(testRunId, {
      status: "failed",
      finishedAt: new Date(),
      error: errorMessage,
      summary: {
        totalStepsExecuted: stats.stepCount,
        totalDelayTimeMs: stats.totalDelayMs,
        failureReason: errorMessage,
      },
    });

    throw error;
  }
};
