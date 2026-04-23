import QuizzesDao from "./dao.js";
export default function QuizRoutes(app, db) {
  const dao = QuizzesDao(db);

  // ── Quizzes ──
  const findQuizzesForCourse = (req, res) => {
    const { courseId } = req.params;
    const quizzes = dao.findQuizzesForCourse(courseId);
    res.json(quizzes);
  };
  const findQuizById = (req, res) => {
    const { quizId } = req.params;
    const quiz = dao.findQuizById(quizId);
    if (!quiz) { res.status(404).json({ message: "Quiz not found" }); return; }
    res.json(quiz);
  };
  const createQuiz = (req, res) => {
    const { courseId } = req.params;
    const quiz = { ...req.body, course: courseId };
    const newQuiz = dao.createQuiz(quiz);
    res.json(newQuiz);
  };
  const updateQuiz = (req, res) => {
    const { quizId } = req.params;
    const result = dao.updateQuiz(quizId, req.body);
    if (!result) { res.status(404).json({ message: "Quiz not found" }); return; }
    res.json(result);
  };
  const deleteQuiz = (req, res) => {
    const { quizId } = req.params;
    dao.deleteQuiz(quizId);
    res.sendStatus(200);
  };

  // ── Questions ──
  const findQuestionsForQuiz = (req, res) => {
    const { quizId } = req.params;
    const questions = dao.findQuestionsForQuiz(quizId);
    res.json(questions);
  };
  const createQuestion = (req, res) => {
    const { quizId } = req.params;
    const question = { ...req.body, quiz: quizId };
    const newQuestion = dao.createQuestion(question);
    res.json(newQuestion);
  };
  const updateQuestion = (req, res) => {
    const { questionId } = req.params;
    const result = dao.updateQuestion(questionId, req.body);
    if (!result) { res.status(404).json({ message: "Question not found" }); return; }
    res.json(result);
  };
  const deleteQuestion = (req, res) => {
    const { questionId } = req.params;
    dao.deleteQuestion(questionId);
    res.sendStatus(200);
  };

  // ── Attempts ──
  const findAttemptsForQuiz = (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) { res.sendStatus(401); return; }
    const attempts = dao.findAttemptsForQuiz(quizId, currentUser._id);
    res.json(attempts);
  };
  const getLatestAttempt = (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) { res.sendStatus(401); return; }
    const attempt = dao.getLatestAttempt(quizId, currentUser._id);
    res.json(attempt);
  };
  const submitAttempt = (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) { res.sendStatus(401); return; }

    const quiz = dao.findQuizById(quizId);
    if (!quiz) { res.status(404).json({ message: "Quiz not found" }); return; }

    // Check attempt limits for students
    if (currentUser.role === "STUDENT") {
      const existingAttempts = dao.findAttemptsForQuiz(quizId, currentUser._id);
      const maxAttempts = quiz.multipleAttempts ? (quiz.howManyAttempts || 1) : 1;
      if (existingAttempts.length >= maxAttempts) {
        res.status(403).json({ message: "Maximum attempts reached" });
        return;
      }
    }

    const questions = dao.findQuestionsForQuiz(quizId);
    const { answers } = req.body; // { questionId: answer }
    let score = 0;
    const results = {};

    for (const q of questions) {
      const userAnswer = answers[q._id];
      let correct = false;
      if (q.type === "Multiple Choice") {
        correct = userAnswer === q.correctAnswer;
      } else if (q.type === "True/False") {
        correct = userAnswer === q.correctAnswer;
      } else if (q.type === "Fill in the Blank") {
        correct = q.correctAnswers.some(
          (a) => a.toLowerCase().trim() === String(userAnswer || "").toLowerCase().trim()
        );
      }
      if (correct) score += q.points;
      results[q._id] = { correct, userAnswer, points: correct ? q.points : 0 };
    }

    const attempt = dao.createAttempt({
      quiz: quizId,
      user: currentUser._id,
      answers,
      results,
      score,
      totalPoints: quiz.points,
      submittedAt: new Date().toISOString(),
      attemptNumber: (dao.findAttemptsForQuiz(quizId, currentUser._id).length),
    });

    res.json(attempt);
  };

  // Quiz routes
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.post("/api/courses/:courseId/quizzes", createQuiz);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);

  // Question routes
  app.get("/api/quizzes/:quizId/questions", findQuestionsForQuiz);
  app.post("/api/quizzes/:quizId/questions", createQuestion);
  app.put("/api/questions/:questionId", updateQuestion);
  app.delete("/api/questions/:questionId", deleteQuestion);

  // Attempt routes
  app.get("/api/quizzes/:quizId/attempts", findAttemptsForQuiz);
  app.get("/api/quizzes/:quizId/attempts/latest", getLatestAttempt);
  app.post("/api/quizzes/:quizId/attempts", submitAttempt);
}
