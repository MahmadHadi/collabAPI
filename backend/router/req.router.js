// routes.js
import express from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  runRequest,
} from "../controller/req.controller.js";

const router = express.Router();

router.post("/", createRequest);
router.post("/:id/run", runRequest);
router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;
