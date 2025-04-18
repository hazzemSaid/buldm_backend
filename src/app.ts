
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import verifyToken from "./middleware/verifyToken";
import postRoute from "./routes/postRoute/postRoute";
import userRoute from "./routes/userRoute/userRoute";

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "uploads")));

const url = process.env.MONGODB_URL as string;
console.log(url);


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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	res.status(err.statusCode ?? 404).json({
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
