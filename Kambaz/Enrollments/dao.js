import { v4 as uuidv4 } from "uuid";
export default function EnrollmentsDao(db) {
  const enrollUserInCourse = (userId, courseId) => {
    db.enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
  };
  const unenrollUserFromCourse = (userId, courseId) => {
    db.enrollments = db.enrollments.filter(
      (e) => !(e.user === userId && e.course === courseId)
    );
  };
  const findEnrollmentsForUser = (userId) => {
    return db.enrollments.filter((e) => e.user === userId);
  };
  return { enrollUserInCourse, unenrollUserFromCourse, findEnrollmentsForUser };
}