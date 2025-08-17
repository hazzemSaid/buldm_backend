// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date().toISOString() }});

export default mongoose.model("Message", messageSchema);

