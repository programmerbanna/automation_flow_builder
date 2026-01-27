import mongoose from "mongoose";
import AutomationExecutionLog from "../models/AutomationExecutionLog";

/**
 * Helper to log node execution lifecycle events without crashing the main flow
 */
export const logNodeExecution = async (data: {
  testRunId: string;
  automationId: string;
  nodeId: string;
  nodeType: any;
  status: "started" | "completed" | "failed";
  message?: string;
  logId?: string; // If provided, updates existing log
}) => {
  try {
    if (data.logId) {
      // Update existing log
      return await AutomationExecutionLog.findByIdAndUpdate(
        data.logId,
        {
          status: data.status,
          message: data.message,
          finishedAt: data.status !== "started" ? new Date() : undefined,
        },
        { new: true }
      );
    } else {
      // Create new log
      return await AutomationExecutionLog.create({
        testRunId: new mongoose.Types.ObjectId(data.testRunId),
        automationId: new mongoose.Types.ObjectId(data.automationId),
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        status: data.status,
        message: data.message,
        startedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("❌ Execution Logging Error:", error);
    return null;
  }
};
