import express from "express";
import {
  createAutomation,
  getAutomations,
  getAutomationById,
  updateAutomation,
  deleteAutomation,
} from "../controllers/automationController";

const router = express.Router();

// Base route: /api/automations
router.route("/").post(createAutomation).get(getAutomations);

router
  .route("/:id")
  .get(getAutomationById)
  .put(updateAutomation)
  .delete(deleteAutomation);

export default router;
