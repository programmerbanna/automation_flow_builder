import { Request, Response } from "express";
import Automation from "../models/Automation";
import AutomationTestRun from "../models/AutomationTestRun";
import { runAutomation } from "../services/automationRunner";
import { ApiResponse } from "../types";
import AutomationExecutionLog from "../models/AutomationExecutionLog";

interface TestRunRequest {
  email: string;
}

import { validateFlow } from "../utils/flowValidator";

// @desc    Start test run for an automation
// @route   POST /api/automations-test/:id/test
// @access  Public
export const startTestRun = async (
  req: Request<{ id: string }, {}, TestRunRequest>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    // Check if automation exists
    const automation = await Automation.findById(id);

    if (!automation) {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    // Phase 5: Flow Validation
    const validation = validateFlow(automation);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: `Validation Error: ${validation.message}`,
      });
      return;
    }

    // Create test run record
    const testRun = await AutomationTestRun.create({
      automationId: automation._id,
      email: email.trim().toLowerCase(),
      status: "running",
      currentStep: "start",
    });

    // Respond immediately
    res.status(200).json({
      success: true,
      data: {
        testRunId: testRun._id,
        status: "started",
        message: "Test run started successfully",
      },
    });

    // Execute automation in background
    runAutomation(
      automation,
      email.trim().toLowerCase(),
      testRun._id.toString(),
    ).catch((error) => {
      console.error("Background execution error:", error);
    });
  } catch (error) {
    if ((error as any).kind === "ObjectId") {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error starting test run",
      error: errorMessage,
    });
  }
};

// @desc    Get execution summary for a test run
// @route   GET /api/automations-test/:id/summary
// @access  Public
export const getExecutionSummary = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const testRun = await AutomationTestRun.findById(req.params.id)
      .select("status error startedAt finishedAt summary automationId")
      .populate("automationId", "name");

    if (!testRun) {
      res.status(404).json({
        success: false,
        message: "Test run not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: testRun,
    });
  } catch (error) {
    if ((error as any).kind === "ObjectId") {
      res.status(404).json({
        success: false,
        message: "Test run not found",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error fetching execution summary",
      error: errorMessage,
    });
  }
};

// @desc    Get test run status
// @route   GET /api/test-runs/:id
// @access  Public
export const getTestRunStatus = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const testRun = await AutomationTestRun.findById(req.params.id).populate(
      "automationId",
      "name",
    );

    if (!testRun) {
      res.status(404).json({
        success: false,
        message: "Test run not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: testRun,
    });
  } catch (error) {
    // Handle invalid ObjectId
    if ((error as any).kind === "ObjectId") {
      res.status(404).json({
        success: false,
        message: "Test run not found",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error fetching test run",
      error: errorMessage,
    });
  }
};

// @desc    Get all test runs for an automation
// @route   GET /api/automations/:id/test-runs
// @access  Public
export const getAutomationTestRuns = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const testRuns = await AutomationTestRun.find({
      automationId: req.params.id,
    })
      .select("email status currentStep startedAt finishedAt error")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testRuns.length,
      data: testRuns,
    });
  } catch (error) {
    // Handle invalid ObjectId
    if ((error as any).kind === "ObjectId") {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error fetching test runs",
      error: errorMessage,
    });
  }
};

// @desc    Get execution logs for a test run
// @route   GET /api/automations-test/:id/logs
// @access  Public
export const getExecutionLogs = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const logs = await AutomationExecutionLog.find({
      testRunId: req.params.id,
    }).sort({ startedAt: 1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    if ((error as any).kind === "ObjectId") {
      res.status(404).json({
        success: false,
        message: "Test run not found",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error fetching execution logs",
      error: errorMessage,
    });
  }
};
