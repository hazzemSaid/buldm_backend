
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import verifyToken from "./middleware/verifyToken";
import sendnotificationRoute from "./routes/notificationRoute/sendnotificationRoute";
import postRoute from "./routes/postRoute/postRoute";
import reportRoute from "./routes/reportRoute/reportRoute";
import userRoute from "./routes/userRoute/userRoute";
import { ICustomError } from "./utils/error";
dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "uploads")));

const url = process.env.MONGODB_URL as string;

mongoose.connect(url)
	.then(() => {
		console.log("MongoDB connected");
	})
	.catch((err) => {
		console.log("MongoDB connection error: ", err);
	});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", verifyToken, postRoute);
app.use("/api/v1/notification", sendnotificationRoute.notificationRouter);
app.use("/api/v1/report",reportRoute );
// Error handling middleware

app.use((err: ICustomError, req: Request, res: Response, next: NextFunction) => {
	res.status(err.statuscode ?? 404).json({
		status: "error",
		error: err.message ?? "something went wrong",
		statuscode: err.statuscode ?? 404,
		data: err.data ?? "no data",
	});
});

// Not found handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		status: "error",
		error: "not found",
		statuscode: 404,
		data: "no data",
	});
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
