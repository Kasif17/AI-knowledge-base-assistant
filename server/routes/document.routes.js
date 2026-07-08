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

router.use(verifyJWT);

router.get("/search", searchDocuments);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.get("/:id", previewDocument);
router.delete("/:id", deleteDocument);

export default router;