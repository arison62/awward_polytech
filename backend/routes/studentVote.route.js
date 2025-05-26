import { Router } from "express";
import { addVote } from "../controllers/studentVote.controller.js";
import authMiddleware from "../auth.middleware.js";
const router = Router();

router.post("/add",authMiddleware, addVote);

export default router

