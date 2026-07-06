import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(`
==========================================
 Server Running
 http://localhost:${PORT}
==========================================
`);

        });

    } catch (error) {

        console.log(error);

        process.exit(1);

    }

};

process.on("SIGINT", async () => {

    console.log("Closing MongoDB Connection...");

    await import("mongoose")
        .then(({ default: mongoose }) => mongoose.connection.close());

    console.log("Database Closed");

    process.exit(0);

});

startServer();