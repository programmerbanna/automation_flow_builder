import express from "express";
import {
  getAutomationTestRuns,
  getExecutionLogs,
  getExecutionSummary,
  getTestRunStatus,
  startTestRun,
} from "../controllers/testRunController";

const router = express.Router();

// Test run routes
router.get("/:id", getTestRunStatus);
router.post("/:id/test", startTestRun);
router.get("/:id/test-runs", getAutomationTestRuns);
router.get("/:id/logs", getExecutionLogs);
router.get("/:id/summary", getExecutionSummary);

export default router;
