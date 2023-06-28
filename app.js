import express from "express";
import postRouter from "./routes/post.js";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

//middlewares
app.use(express.json({limit:'10mb'})); //When a client sends a request to an Express.js server with a JSON payload, the express.json() middleware parses the JSON data and transforms it into a JavaScript object.
app.use(express.urlencoded({ extended: true,limit: '10mb'}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true //if false then response headers will not be sent
}))


//Using routes
app.use("/api/v1", postRouter);
app.use("/api/v1", userRouter);
export default app;