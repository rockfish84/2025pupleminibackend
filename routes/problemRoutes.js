const express = require("express");
const Problem = require("../models/Problem");
const User = require("../models/User");

const router = express.Router();

// 현재 문제 가져오기
router.get("/current", async (req, res) => {
  const userId = req.user.id; // JWT로 인증된 사용자 ID
  const user = await User.findById(userId);

  // 현재 풀고 있는 문제 ID
  const currentProblemId = user.currentProblemId;

  // 해당 문제 찾기
  const problem = await Problem.findOne({ _id: currentProblemId });
  if (!problem) {
    return res.status(404).json({ message: "문제를 찾을 수 없습니다." });
  }

  res.status(200).json(problem);
});

// 문제 추가 (정답 및 문제 제목 포함)
router.post("/add-problems", async (req, res) => {
    const problems = [
      { title: "복면산?", correctAnswer: "puple", problemId: 1 },
      { title: "이븐한 식사", correctAnswer: "-8480", problemId: 2 },
      { title: "Little Bigger Star", correctAnswer: "animal", problemId: 3 },
      { title: "리크루팅 대모험", correctAnswer: "우주최고세계제일", problemId: 4 },
      { title: "이거 어디서 많이 봤는데", correctAnswer: "we invite u", problemId: 5 },
      { title: "자기소개 퍼플 방탈출", correctAnswer: "퍼플 방탈출", problemId: 6 },
      { title: "집에 가는 길", correctAnswer: "world", problemId: 7 },
      { title: "시간을 달려서 @kaist_puple", correctAnswer: "tiny", problemId: 8 },
    ];
  
    try {
      // 문제 데이터를 MongoDB에 저장
      for (const problem of problems) {
        const newProblem = new Problem(problem);
        await newProblem.save();
      }
  
      res.status(201).json({ message: "문제들이 성공적으로 추가되었습니다." });
    } catch (error) {
      console.error("문제 추가 오류:", error);
      res.status(500).json({ message: "문제 추가 실패", error });
    }
  });

  const compareAnswer = (userAnswer, correctAnswer) => {
    if (!userAnswer || !correctAnswer) {
        console.log("❌ compareAnswer() - 정답이 undefined 또는 null:", { userAnswer, correctAnswer });
        return false;
    }

    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '').toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.replace(/\s+/g, '').toLowerCase();

    console.log("🔍 비교할 값:", { normalizedUserAnswer, normalizedCorrectAnswer });

    return normalizedUserAnswer === normalizedCorrectAnswer;
};
router.post("/submit", async (req, res) => {
  const { problemId, answer, userId } = req.body;

  if (!answer) {
      return res.status(400).json({ message: "정답을 입력하세요." });
  }

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const problem = await Problem.findOne({ problemId: Number(problemId) });

      if (!problem) {
          return res.status(400).json({ message: "문제를 찾을 수 없습니다." });
      }

      if (!problem.correctAnswer) {
          return res.status(500).json({ message: "정답 정보가 없습니다." });
      }

      const isCorrect = compareAnswer(answer, problem.correctAnswer);

      console.log(`✅ 정답 확인됨: ${isCorrect ? "맞음" : "틀림"}`);

      if (isCorrect) {
          let updatedProblemId = user.currentProblemId;

          // ✅ 사용자의 현재 문제 ID가 제출된 문제 ID와 같다면 1 증가
          if (user.currentProblemId === problemId) {
              updatedProblemId += 1;
              user.currentProblemId = updatedProblemId;
              await user.save();
          }

          return res.status(200).json({
              message: "정답입니다!",
              isCorrect: true,
              nextProblemId: updatedProblemId,
          });
      } else {
          return res.status(400).json({
              message: "정답이 틀렸습니다.",
              isCorrect: false,
          });
      }
  } catch (error) {
      console.error("🚨 정답 제출 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


router.get("/problems/history", async (req, res) => {
    const maxProblemId = parseInt(req.query.maxProblemId, 10);
  
    try {
      const problems = await Problem.find({ problemId: { $lte: maxProblemId } }).sort({ problemId: 1 });
      res.status(200).json(problems);
    } catch (error) {
      console.error("🚨 문제 히스토리 가져오기 오류:", error);
      res.status(500).json({ message: "서버 오류 발생" });
    }
});

module.exports = router;
