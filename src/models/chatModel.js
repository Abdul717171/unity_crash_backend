const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  content: { type: String },
  time: { type: String },
  date: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
