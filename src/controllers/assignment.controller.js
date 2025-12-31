import { db } from "../config/db.js";

/* ===============================
   TEACHER: ADD ASSIGNMENT
================================ */
export const addAssignment = (req, res) => {
  const { standard, subject, due_date } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  db.query(
    `
    INSERT INTO assignments 
    (standard, subject_id, file_path, due_date, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
    `,
    [standard, subject, req.file.filename, due_date, req.user.id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        success: true,
        message: "Assignment uploaded successfully",
      });
    }
  );
};


/* ===============================
   STUDENT: GET ASSIGNMENTS
================================ */
export const getAssignmentsForStudent = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT s.id AS student_id, s.standard
    FROM students s
    WHERE s.user_id = ?
    `,
    [userId],
    (err, studentRows) => {
      if (err || !studentRows.length) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentId = studentRows[0].student_id;
      const standard = studentRows[0].standard;

      db.query(
        `
        SELECT 
          a.id,
          a.subject_id,
          a.file_path,
          a.due_date,
          a.created_at,
          (
            SELECT COUNT(*) 
            FROM assignment_submissions s
            WHERE s.assignment_id = a.id
              AND s.student_id = ?
          ) AS submitted
        FROM assignments a
        WHERE a.standard = ?
        ORDER BY a.due_date ASC
        `,
        [studentId, standard],
        (err, rows) => {
          if (err) return res.status(500).json(err);
          res.json(rows);
        }
      );
    }
  );
};


/* ===============================
   STUDENT: SUBMIT ASSIGNMENT
================================ */
export const submitAssignment = (req, res) => {
  const userId = req.user.id;
  const { assignment_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File required" });
  }

  // Get student.id from users.id
  db.query(
    "SELECT id FROM students WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err || !rows.length) {
        return res.status(400).json({ message: "Student not found" });
      }

      const studentId = rows[0].id;

      // Prevent duplicate submission
      db.query(
        `
        SELECT id FROM assignment_submissions
        WHERE assignment_id = ? AND student_id = ?
        `,
        [assignment_id, studentId],
        (err, existing) => {
          if (existing.length) {
            return res
              .status(400)
              .json({ message: "Assignment already submitted" });
          }

          db.query(
            `
            INSERT INTO assignment_submissions
            (assignment_id, student_id, file_path)
            VALUES (?, ?, ?)
            `,
            [assignment_id, studentId, req.file.filename],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({
                success: true,
                message: "Assignment submitted successfully",
              });
            }
          );
        }
      );
    }
  );
};

