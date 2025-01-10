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
import {router as videoRouter} from "./routes/video.routes.js"
import {router as playlistRouter} from "./routes/playlist.routes.js"
import {router as healthCheckRouter} from "./routes/healthCheck.routes.js"
import {router as tweetRouter} from "./routes/tweet.route.js";
import {router as likeRouter} from "./routes/like.route.js";
import {router as commentRouter} from "./routes/comment.route.js";
import {router as dashboardRouter} from "./routes/dashboard.route.js"

app.use("/api/v1/users",userRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/video",videoRouter);
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/healthCheck",healthCheckRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/dashboard",dashboardRouter)

export { app }