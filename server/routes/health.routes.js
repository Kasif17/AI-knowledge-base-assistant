import express from "express";

const router = express.Router();

router.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        database: "Connected",

        uptime: process.uptime()

    });

});

export default router;