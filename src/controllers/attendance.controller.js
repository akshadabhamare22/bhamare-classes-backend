import { db } from "../config/db.js";

export const markAttendance = (req, res) => {
  const { date, records } = req.body;

  if (!date || !records || !records.length) {
    return res.status(400).json({
      message: "Date and attendance records are required",
    });
  }

  const values = records.map(r => [
    r.student_id,
    date,
    r.status,
    req.user.id,
  ]);

  const sql = `
    INSERT INTO attendance (student_id, date, status, marked_by)
    VALUES ?
  `;

  db.query(sql, [values], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json({ success: true, message: "Attendance marked successfully" });
  });
};

export const getAttendanceByStudent = (req, res) => {
  const studentId = req.user.id;

  db.query(
    `
    SELECT date, status 
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE s.user_id = ?
    ORDER BY date DESC
    `,
    [studentId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};


export const getAttendanceForAdmin = (req, res) => {
  const { standard } = req.query;

  let sql = `
    SELECT 
      u.name,
      s.standard,
      a.date,
      a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
  `;

  const params = [];

  if (standard) {
    sql += " WHERE s.standard = ?";
    params.push(standard);
  }

  sql += " ORDER BY a.date DESC";

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

export const getStudentsByStandard = (req, res) => {
  const { standard } = req.query;

  if (!standard) {
    return res.status(400).json({
      message: "Standard is required",
    });
  }

  db.query(
    `
    SELECT s.id, u.name
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.standard = ?
    ORDER BY u.name
    `,
    [standard],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
};
