import EnrollmentsDao from "./dao.js";
export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const enroll = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) { res.sendStatus(401); return; }
    const { courseId } = req.params;
    dao.enrollUserInCourse(currentUser._id, courseId);
    res.sendStatus(200);
  };

  const unenroll = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) { res.sendStatus(401); return; }
    const { courseId } = req.params;
    dao.unenrollUserFromCourse(currentUser._id, courseId);
    res.sendStatus(200);
  };

  app.post("/api/users/current/enrollments/:courseId", enroll);
  app.delete("/api/users/current/enrollments/:courseId", unenroll);
}