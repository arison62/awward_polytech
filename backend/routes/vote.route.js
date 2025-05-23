import {Router} from 'express';

const router = Router();

import {createVote, getUpToDateVotes, getUpTodateVotesByUserGroup ,deleteVote, updateVote, getVote, getAllVotes} from "../controllers/vote.controller.js";
import authMiddleware from "../auth.middleware.js";


router.get("/get", getUpToDateVotes)
router.get("/get/:id", getVote)
router.get("/all",  getAllVotes)

router.post("/create", authMiddleware, createVote)
router.post("/update/:id", authMiddleware, updateVote)
router.delete("/delete/:id", authMiddleware, deleteVote)

export default router