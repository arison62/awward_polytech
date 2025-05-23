import { Router } from "express";

const router = Router();

import {createGroup, deleteGroup, getGroups} from "../controllers/groupe.controller.js";
import authMiddleware from "../auth.middleware.js";

router.post("/create", authMiddleware, createGroup)
router.delete("/delete/:groupId", authMiddleware, deleteGroup)
router.get("/:id", getGroups);
router.get("/", getGroups);
export default router