import { Request, Response } from "express";
import Automation from "../models/Automation";
import {
  CreateAutomationRequest,
  UpdateAutomationRequest,
  ApiResponse,
} from "../types";

// @desc    Create new automation
// @route   POST /api/automations
// @access  Public
export const createAutomation = async (
  req: Request<{}, {}, CreateAutomationRequest>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const { name, nodes, edges } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Automation name is required",
      });
      return;
    }

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      res.status(400).json({
        success: false,
        message: "Nodes are required and must be a non-empty array",
      });
      return;
    }

    if (!edges || !Array.isArray(edges)) {
      res.status(400).json({
        success: false,
        message: "Edges are required and must be an array",
      });
      return;
    }

    // Check for duplicate name
    const existingAutomation = await Automation.findOne({
      name: name.trim(),
    });

    if (existingAutomation) {
      res.status(409).json({
        success: false,
        message: "An automation with this name already exists",
      });
      return;
    }

    const automation = await Automation.create({
      name: name.trim(),
      nodes,
      edges,
    });

    res.status(201).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    // Handle duplicate key error from MongoDB
    if ((error as any).code === 11000) {
      res.status(409).json({
        success: false,
        message: "An automation with this name already exists",
      });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error creating automation",
      error: errorMessage,
    });
  }
};

// @desc    Get all automations
// @route   GET /api/automations
// @access  Public
export const getAutomations = async (
  req: Request,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const automations = await Automation.find()
      .select("_id name createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: automations.length,
      data: automations,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Error fetching automations",
      error: errorMessage,
    });
  }
};

// @desc    Get single automation by ID
// @route   GET /api/automations/:id
// @access  Public
export const getAutomationById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: automation,
    });
  } catch (error) {
    // Handle invalid ObjectId format
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
      message: "Error fetching automation",
      error: errorMessage,
    });
  }
};

// @desc    Update automation
// @route   PUT /api/automations/:id
// @access  Public
export const updateAutomation = async (
  req: Request<{ id: string }, {}, UpdateAutomationRequest>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const { name, nodes, edges } = req.body;

    // Find automation first
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    // Validation
    if (name !== undefined) {
      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: "Automation name cannot be empty",
        });
        return;
      }

      // Check for duplicate name (excluding current automation)
      const existingAutomation = await Automation.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingAutomation) {
        res.status(409).json({
          success: false,
          message: "An automation with this name already exists",
        });
        return;
      }

      automation.name = name.trim();
    }

    if (nodes !== undefined) {
      if (!Array.isArray(nodes) || nodes.length === 0) {
        res.status(400).json({
          success: false,
          message: "Nodes must be a non-empty array",
        });
        return;
      }
      automation.nodes = nodes;
    }

    if (edges !== undefined) {
      if (!Array.isArray(edges)) {
        res.status(400).json({
          success: false,
          message: "Edges must be an array",
        });
        return;
      }
      automation.edges = edges;
    }

    const updatedAutomation = await automation.save();

    res.status(200).json({
      success: true,
      data: updatedAutomation,
    });
  } catch (error) {
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      res.status(409).json({
        success: false,
        message: "An automation with this name already exists",
      });
      return;
    }

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
      message: "Error updating automation",
      error: errorMessage,
    });
  }
};

// @desc    Delete automation
// @route   DELETE /api/automations/:id
// @access  Public
export const deleteAutomation = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      res.status(404).json({
        success: false,
        message: "Automation not found",
      });
      return;
    }

    await automation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Automation deleted successfully",
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
      message: "Error deleting automation",
      error: errorMessage,
    });
  }
};
