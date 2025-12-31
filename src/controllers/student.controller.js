import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/* =====================================
   ADMIN: ADMIT STUDENT
===================================== */
export const admitStudent = (req, res) => {
  const {
    name,
    email,
    password,
    standard,
    division,
    parent_name,
    parent_mobile,
  } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
    [name, email, hashed],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const userId = result.insertId;

      db.query(
        `
        INSERT INTO students
        (user_id, standard, division, parent_name, parent_mobile)
        VALUES (?, ?, ?, ?, ?)
        `,
        [userId, standard, division, parent_name, parent_mobile],
        () => {
          res.json({ success: true, message: "Student admitted successfully" });
        }
      );
    }
  );
};

/* =====================================
   ADMIN: STUDENT LIST
===================================== */
export const getAdmissionList = (req, res) => {
  const { search = "", standard = "", division = "" } = req.query;

  db.query(
    `
    SELECT s.id, u.name, u.email, s.standard, s.division,
           s.parent_name, s.parent_mobile
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.name LIKE ?
      AND s.standard LIKE ?
      AND s.division LIKE ?
    ORDER BY s.id DESC
    `,
    [`%${search}%`, `%${standard}%`, `%${division}%`],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* =====================================
   ADMIN: UPDATE STUDENT
===================================== */
export const updateStudent = (req, res) => {
  const { id } = req.params;
  const { standard, division, parent_name, parent_mobile } = req.body;

  db.query(
    `
    UPDATE students
    SET standard=?, division=?, parent_name=?, parent_mobile=?
    WHERE id=?
    `,
    [standard, division, parent_name, parent_mobile, id],
    () => res.json({ success: true })
  );
};

/* =====================================
   ADMIN: DELETE STUDENT
===================================== */
export const deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM users WHERE id = (SELECT user_id FROM students WHERE id=?)",
    [id],
    () => res.json({ success: true })
  );
};

/* =====================================
   STUDENT: OWN PROFILE
===================================== */
export const getStudentProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT u.name, u.email,
           s.standard, s.division,
           s.parent_name, s.parent_mobile
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.id = ?
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows[0]);
    }
  );
};

/* =====================================
   STUDENT: ATTENDANCE
===================================== */
export const getStudentAttendance = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT a.date, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE s.user_id = ?
    ORDER BY a.date DESC
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* =====================================
   STUDENT: FEES + PAYMENTS
===================================== */
export const getStudentFees = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT f.total_amount,
           IFNULL(SUM(p.amount),0) AS paid
    FROM students s
    JOIN fees f ON s.id = f.student_id
    LEFT JOIN payments p ON p.student_id = s.id
    WHERE s.user_id = ?
    GROUP BY f.total_amount
    `,
    [userId],
    (err, summary) => {
      if (err) return res.status(500).json(err);

      db.query(
        `
        SELECT amount, method, payment_date
        FROM payments
        WHERE student_id = (SELECT id FROM students WHERE user_id=?)
        ORDER BY payment_date DESC
        `,
        [userId],
        (err2, payments) => {
          if (err2) return res.status(500).json(err2);
          res.json({ summary: summary[0], payments });
        }
      );
    }
  );
};

/* =====================================
   STUDENT: ASSIGNMENTS
===================================== */
export const getStudentAssignments = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT a.id, a.standard, a.due_date, a.file_path
    FROM assignments a
    JOIN students s ON a.standard = s.standard
    WHERE s.user_id = ?
    ORDER BY a.due_date ASC
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* =====================================
   STUDENT: TIMETABLE
===================================== */
export const getStudentTimetable = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT t.day, t.start_time, t.end_time, sub.name AS subject
    FROM timetable t
    JOIN subjects sub ON t.subject_id = sub.id
    JOIN students s ON s.standard = t.standard
    WHERE s.user_id = ?
    ORDER BY FIELD(t.day,'Mon','Tue','Wed','Thu','Fri','Sat'),
             t.start_time
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* =====================================
   EXPORTS (EXCEL + PDF)
===================================== */
export const exportAdmissionExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Admissions");

  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Email", key: "email", width: 25 },
    { header: "Standard", key: "standard", width: 12 },
    { header: "Division", key: "division", width: 12 },
    { header: "Parent", key: "parent_name", width: 20 },
    { header: "Mobile", key: "parent_mobile", width: 15 },
  ];

  db.query(
    `
    SELECT u.name, u.email, s.standard, s.division,
           s.parent_name, s.parent_mobile
    FROM students s
    JOIN users u ON s.user_id = u.id
    `,
    async (err, rows) => {
      if (err) return res.status(500).json(err);
      rows.forEach(row => sheet.addRow(row));

      res.setHeader("Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition",
        "attachment; filename=admissions.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    }
  );
};

export const exportAdmissionPDF = (req, res) => {
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=admissions.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Bhamare Classes – Admission List", { align: "center" });
  doc.moveDown();

  db.query(
    `
    SELECT u.name, s.standard, s.division,
           s.parent_name, s.parent_mobile
    FROM students s
    JOIN users u ON s.user_id = u.id
    `,
    (err, rows) => {
      if (err) return res.end();
      rows.forEach(s => {
        doc.text(`${s.name} | Std ${s.standard}${s.division} | ${s.parent_name} | ${s.parent_mobile}`);
      });
      doc.end();
    }
  );
};
