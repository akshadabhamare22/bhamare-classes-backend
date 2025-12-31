import bcrypt from "bcryptjs";
import { db } from "../config/db.js";

/* =====================================
   ADMIN: ADD TEACHER
===================================== */
export const addTeacher = (req, res) => {
  const {
    name,
    email,
    password,
    qualification,
    experience_years,
    joining_date,
  } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  // 1️⃣ Insert into users table
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')",
    [name, email, hashedPassword],
    (err, userResult) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json(err);
      }

      const userId = userResult.insertId;

      // 2️⃣ Insert into teachers table
      db.query(
        `
        INSERT INTO teachers 
        (user_id, qualification, experience_years, joining_date)
        VALUES (?, ?, ?, ?)
        `,
        [userId, qualification, experience_years, joining_date],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            success: true,
            message: "Teacher added successfully",
          });
        }
      );
    }
  );
};

/* =====================================
   ADMIN: GET ALL TEACHERS
===================================== */
export const getTeachers = (req, res) => {
  db.query(
    `
    SELECT 
      t.id,
      u.name,
      u.email,
      t.qualification,
      t.experience_years,
      t.joining_date
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.id DESC
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

/* =====================================
   ADMIN: DELETE TEACHER
===================================== */
export const deleteTeacher = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM users WHERE id = (SELECT user_id FROM teachers WHERE id = ?)",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Teacher deleted successfully" });
    }
  );
};

/* =====================================
   TEACHER: GET OWN PROFILE
===================================== */
export const getTeacherProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT 
      u.name,
      u.email,
      t.qualification,
      t.experience_years,
      t.joining_date
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    WHERE u.id = ?
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (!rows.length)
        return res.status(404).json({ message: "Teacher not found" });

      res.json(rows[0]);
    }
  );
};

/* =====================================
   TEACHER: UPDATE OWN PROFILE
===================================== */
export const updateTeacherProfile = (req, res) => {
  const userId = req.user.id;
  const { qualification, experience_years } = req.body;

  db.query(
    `
    UPDATE teachers
    SET qualification=?, experience_years=?
    WHERE user_id=?
    `,
    [qualification, experience_years, userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Profile updated" });
    }
  );
};
