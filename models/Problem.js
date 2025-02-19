const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 문제 제목
  correctAnswer: { type: String, required: true }, // 정답
  problemId: { type: Number, required: true }, // 현재 문제 id
});

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
