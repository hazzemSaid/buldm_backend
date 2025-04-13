const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const postRoute = require("./routes/postRoute/postRoute");
const userRoute = require("./routes/userRoute/userRoute");
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//static files
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "uploads")));
const url = process.env.MONGODB_URL;

mongoose.connect(url).then(() => {
	console.log("MongoDB connected");
}
).catch((err) => {
	console.log("MongoDB connection error: ", err);
});


app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use((err, req, res, next) => {
	res.status(err.statuscode ?? 404).json({
		status: "error",
		error: err.message ?? "something went wrong",
		statuscode: err.statuscode ?? 404,
		data: err.data ?? "no data",
	});
});
app.use((req, res) => {
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