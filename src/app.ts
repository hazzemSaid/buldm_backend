import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import { setupSwagger } from "./config/swagger";
import verifyToken from "./middleware/verifyToken";
import imagePredictionRouter from "./routes/imagepredict/imagepredictroute";
import messageRoute from "./routes/messageRoute/messageRoute";
import sendnotificationRoute from "./routes/notificationRoute/sendnotificationRoute";
import postRoute from "./routes/postRoute/postRoute";
import reportRoute from "./routes/reportRoute/reportRoute";
import userRoute from "./routes/userRoute/userRoute";
import { ICustomError } from "./utils/error";
const MessageModel = require("./model/messageModel"); // ✅ تأكد من المسار الصحيح

var morgan = require("morgan");
dotenv.config();

const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "uploads")));

const url = process.env.MONGODB_URL as string;

mongoose
	.connect(url)
	.then(() => {
		console.log("MongoDB connected");
	})
	.catch((err) => {
		console.log("MongoDB connection error: ", err);
	});
setupSwagger(app);
// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", verifyToken, postRoute);
app.use("/api/v1/notification", sendnotificationRoute.notificationRouter);
app.use("/api/v1/report", reportRoute);
app.use("/api/v1/predict", imagePredictionRouter);
app.use("/api/v1/chat", messageRoute);
// Error handling middleware

app.use(
	(err: ICustomError, req: Request, res: Response, next: NextFunction) => {
		res.status(err.statuscode ?? 404).json({
			status: "error",
			error: err.message ?? "something went wrong",
			statuscode: err.statuscode ?? 404,
			data: err.data ?? "no data",
		});
	}
);

// Not found handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		status: "error",
		error: "not found",
		statuscode: 404,
		data: "no data",
	});
});

//real time socket connection
const users = new Map();

io.on("connection", (socket) => {
	socket.on("register", ({ userId }) => {
		users.set(userId, socket.id);
		(socket as any).userId = userId;
		console.log(`${userId} registered with socket ${socket.id}`);
	});

	socket.on("disconnect", () => {
		for (const [userId, sockId] of users.entries()) {
			if (sockId === socket.id) {
				users.delete(userId);
				break;
			}
		}
		console.log(`User disconnected: ${socket.id}`);
	});

	socket.on("SendMessage", async ({ touserId, Message }) => {
		const toSocketId = users.get(touserId);
		const from = (socket as any).userId;

		console.log(`Message from ${from} to ${touserId}: ${Message}`);

		// ✅ احفظ الرسالة دائمًا
		try {
			await MessageModel.create({
				from: from,
				to: touserId,
				message: Message,
			});
		} catch (err) {
			console.error("Error saving message:", err);
		}

		// ✅ ابعت الرسالة لحظيًا لو المستخدم متصل
		if (toSocketId) {
			io.to(toSocketId).emit("ReceiveMessage", { from, Message });
		}
	});
});

const PORT = process.env.PORT || 3000;
httpserver.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
