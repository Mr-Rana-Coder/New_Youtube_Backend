import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Importing Routes
import {router as userRouter} from "./routes/user.routes.js";
import {router as subscriptionRouter} from "./routes/subscription.routes.js"

app.use("/api/v1/users",userRouter);

export { app }