import { v4 as uuidv4 } from "uuid";
export default function QuizzesDao(db) {
  const findQuizzesForCourse = (courseId) => {
    return db.quizzes.filter((q) => q.course === courseId);
  };
  const findQuizById = (quizId) => {
    return db.quizzes.find((q) => q._id === quizId);
  };
  const createQuiz = (quiz) => {
    const newQuiz = { ...quiz, _id: uuidv4() };
    db.quizzes = [...db.quizzes, newQuiz];
    return newQuiz;
  };
  const updateQuiz = (quizId, updates) => {
    const quiz = db.quizzes.find((q) => q._id === quizId);
    if (!quiz) return null;
    Object.assign(quiz, updates);
    return quiz;
  };
  const deleteQuiz = (quizId) => {
    db.quizzes = db.quizzes.filter((q) => q._id !== quizId);
    db.questions = db.questions.filter((q) => q.quiz !== quizId);
    db.attempts = db.attempts.filter((a) => a.quiz !== quizId);
  };

  // Questions
  const findQuestionsForQuiz = (quizId) => {
    return db.questions.filter((q) => q.quiz === quizId);
  };
  const findQuestionById = (questionId) => {
    return db.questions.find((q) => q._id === questionId);
  };
  const createQuestion = (question) => {
    const newQuestion = { ...question, _id: uuidv4() };
    db.questions = [...db.questions, newQuestion];
    return newQuestion;
  };
  const updateQuestion = (questionId, updates) => {
    const question = db.questions.find((q) => q._id === questionId);
    if (!question) return null;
    Object.assign(question, updates);
    return question;
  };
  const deleteQuestion = (questionId) => {
    db.questions = db.questions.filter((q) => q._id !== questionId);
  };

  // Attempts
  const findAttemptsForQuiz = (quizId, userId) => {
    return db.attempts.filter((a) => a.quiz === quizId && a.user === userId);
  };
  const findAttemptById = (attemptId) => {
    return db.attempts.find((a) => a._id === attemptId);
  };
  const createAttempt = (attempt) => {
    const newAttempt = { ...attempt, _id: uuidv4() };
    db.attempts = [...db.attempts, newAttempt];
    return newAttempt;
  };
  const getLatestAttempt = (quizId, userId) => {
    const userAttempts = db.attempts
      .filter((a) => a.quiz === quizId && a.user === userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return userAttempts.length > 0 ? userAttempts[0] : null;
  };

  return {
    findQuizzesForCourse, findQuizById, createQuiz, updateQuiz, deleteQuiz,
    findQuestionsForQuiz, findQuestionById, createQuestion, updateQuestion, deleteQuestion,
    findAttemptsForQuiz, findAttemptById, createAttempt, getLatestAttempt,
  };
}
