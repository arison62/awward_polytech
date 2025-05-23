import { Router } from "express";

const router = Router();

import { createAdmin } from "../controllers/admin.controller.js";
import { signInAdmin } from "../controllers/admin.controller.js";

router.post("/signup", createAdmin);
router.post("/signin", signInAdmin);

export default router;