import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import apiLimiter from "./middlewares/rateLimiter.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

import healthRoute from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(helmet());

app.use(compression());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(apiLimiter);

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "AI Knowledge Base Assistant API"

    });

});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1", conversationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/health", healthRoute);

app.use(notFound);

app.use(errorHandler);

export default app;