import{Router} from "express";

const router = Router();

import {createStudentsBulk, loginStudent, createStudent} from "../controllers/student.controller.js";
import authMiddleware from "../auth.middleware.js";

router.post("/bulk-create", authMiddleware ,createStudentsBulk)
router.post("/login", loginStudent)
router.post("/create", createStudent)

export default router