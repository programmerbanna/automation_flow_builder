import mongoose, { Schema, Document } from "mongoose";

export interface IAutomationExecutionLog extends Document {
  testRunId: mongoose.Types.ObjectId;
  automationId: mongoose.Types.ObjectId;
  nodeId: string;
  nodeType: "start" | "action" | "delay" | "condition" | "end";
  status: "started" | "completed" | "failed";
  message?: string;
  startedAt: Date;
  finishedAt?: Date;
}

const executionLogSchema = new Schema<IAutomationExecutionLog>(
  {
    testRunId: {
      type: Schema.Types.ObjectId,
      ref: "AutomationTestRun",
      required: [true, "Test run ID is required"],
      index: true,
    },
    automationId: {
      type: Schema.Types.ObjectId,
      ref: "Automation",
      required: [true, "Automation ID is required"],
      index: true,
    },
    nodeId: {
      type: String,
      required: [true, "Node ID is required"],
    },
    nodeType: {
      type: String,
      enum: ["start", "action", "delay", "condition", "end"],
      required: [true, "Node type is required"],
    },
    status: {
      type: String,
      enum: ["started", "completed", "failed"],
      required: [true, "Status is required"],
    },
    message: {
      type: String,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const AutomationExecutionLog = mongoose.model<IAutomationExecutionLog>(
  "AutomationExecutionLog",
  executionLogSchema,
);

export default AutomationExecutionLog;
