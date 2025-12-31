import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const register = (req, res) => {
  const {
    name,
    email,
    password,
    standard,
    division = "A",
    parent_name,
    parent_mobile,
  } = req.body;

  const role = "student";

  if (!name || !email || !password || !standard) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const hashed = bcrypt.hashSync(password, 10);

  // 1️⃣ Insert into USERS
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashed, role],
    (err, userResult) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      const userId = userResult.insertId;

      // 2️⃣ Insert into STUDENTS
      db.query(
        `
        INSERT INTO students 
        (user_id, name, standard, division, parent_name, parent_mobile)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [userId, name, standard, division, parent_name, parent_mobile],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json({
            success: true,
            message: "Student registered successfully",
          });
        }
      );
    }
  );
};


export const login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, users) => {
      if (!users.length)
        return res.status(401).json({ message: "User not found" });

      const user = users[0];

      const match = bcrypt.compareSync(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token, role: user.role });
    }
  );
};
