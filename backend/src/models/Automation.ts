import mongoose, { Schema } from "mongoose";
import { IAutomation } from "../types";

const automationSchema = new Schema<IAutomation>(
  {
    name: {
      type: String,
      required: [true, "Automation name is required"],
      unique: true,
      trim: true,
      minlength: [1, "Name cannot be empty"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    nodes: {
      type: Schema.Types.Mixed,
      required: [true, "Nodes are required"],
      validate: {
        validator: function (v: any): boolean {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Nodes array cannot be empty",
      },
    },
    edges: {
      type: Schema.Types.Mixed,
      required: [true, "Edges are required"],
      validate: {
        validator: function (v: any): boolean {
          return Array.isArray(v);
        },
        message: "Edges must be an array",
      },
    },
  },
  {
    timestamps: true,
  },
);

const Automation = mongoose.model<IAutomation>("Automation", automationSchema);

export default Automation;
