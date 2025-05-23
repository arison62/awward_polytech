import { Router } from "express";

const router = Router();

import { createCandidacies } from "../controllers/candidacy.controller.js";

router.post("/create", createCandidacies);

export default router
