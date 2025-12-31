import { db } from "../config/db.js";

/* Admin adds timetable */
export const addTimetable = (req, res) => {
  const { standard, day, start_time, end_time, subject, teacher_name } = req.body;

  db.query(
    `
    INSERT INTO timetable
    (standard, day, start_time, end_time, subject, teacher_name)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [standard, day, start_time, end_time, subject, teacher_name],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Timetable added" });
    }
  );
};

/* Student timetable */
export const getStudentTimetable = (req, res) => {
  db.query(
    `
    SELECT * FROM timetable
    WHERE standard = (
      SELECT standard FROM students WHERE user_id = ?
    )
    ORDER BY FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
             start_time
    `,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* Teacher timetable */
export const getTeacherTimetable = (req, res) => {
  db.query(
    `
    SELECT * FROM timetable
    WHERE teacher_name = ?
    ORDER BY FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
             start_time
    `,
    [req.user.name],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
