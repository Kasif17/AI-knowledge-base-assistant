import mongoose from "mongoose";

mongoose.connection.on("connected", () => {

    console.log("MongoDB Connected");

});

mongoose.connection.on("disconnected", () => {

    console.log("MongoDB Disconnected");

});

mongoose.connection.on("error", (err) => {

    console.log(err);

});

// import mongoose from "mongoose";

// const connectDB = async () => {

//     try {

//         const connection = await mongoose.connect(process.env.MONGO_URI, {

//             autoIndex: true,

//             serverSelectionTimeoutMS: 5000

//         });

//         console.log(`
// ==========================================
//  MongoDB Connected Successfully
//  Database : ${connection.connection.name}
//  Host     : ${connection.connection.host}
// ==========================================
// `);

//     } catch (error) {

//         console.error("MongoDB Connection Failed");

//         console.error(error.message);

//         process.exit(1);

//     }

// };

// export default connectDB;