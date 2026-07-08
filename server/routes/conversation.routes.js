import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { askQuestion, getHistory } from "../controllers/conversation.controller.js";

const router = Router();

// Every conversation route requires a logged-in user
router.use(verifyJWT);

router.post("/ask", askQuestion);
router.get("/history", getHistory);

export default router;