import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import upload from "../config/multer.js";
import {
    uploadDocument,
    listDocuments,
    previewDocument,
    deleteDocument,
    searchDocuments,
} from "../controllers/document.controller.js";

const router = Router();

// Every document route requires a logged-in user
router.use(verifyJWT);

// IMPORTANT: /search must be registered BEFORE /:id, otherwise Express
// will match "search" as an :id param and hit the wrong controller.
router.get("/search", searchDocuments);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.get("/:id", previewDocument);
router.delete("/:id", deleteDocument);

export default router;