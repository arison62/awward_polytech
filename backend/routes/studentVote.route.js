import { Router } from "express";
import { addVote, checkUserVoted, getVoteResult } from "../controllers/studentVote.controller.js";
import authMiddleware from "../auth.middleware.js";
const router = Router();

router.post("/add",authMiddleware, addVote);
router.post("/check",authMiddleware, checkUserVoted);
router.get("/:voteId/result", getVoteResult)

export default router

