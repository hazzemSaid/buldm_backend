const express = require("express");
const app = express();
app.use(express.json());
app.use((req, res, next) => {
	return res.status(200).json({
		message: "Hello World",
	});
});
app.listen(3000, () => {
	console.log("Server is running on port 3000");
});