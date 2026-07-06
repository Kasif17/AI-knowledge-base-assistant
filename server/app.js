import express from "express";

import healthRoute from "./routes/health.routes.js";

const app = express();

app.use("/health", healthRoute);

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "AI Knowledge Base Assistant API"

    });

});

export default app;