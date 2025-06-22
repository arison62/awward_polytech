import { Router } from "express";
import { addVote, checkUserVoted } from "../controllers/studentVote.controller.js";
import authMiddleware from "../auth.middleware.js";
const router = Router();

router.post("/add",authMiddleware, addVote);
router.post("/check",authMiddleware, checkUserVoted);

export default router

