import { Router } from "express";

const router = Router();

import {createCategory, updateCategory, deleteCategory, getCategoriesByVoteId} from "../controllers/category.controller.js";
import authMiddleware from "../auth.middleware.js";

router.post("/create", authMiddleware, createCategory)
router.put("/update/:id", authMiddleware, updateCategory)
router.delete("/delete/:id", authMiddleware, deleteCategory)
router.get("/vote/:voteId", getCategoriesByVoteId);

export default router   