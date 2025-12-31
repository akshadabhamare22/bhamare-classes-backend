import { db } from "../config/db.js";

/* ================= ADMIN: SET FEES ================= */
export const setFees = (req, res) => {
  const { student_id, total_amount, academic_year } = req.body;

  if (!student_id || !total_amount || !academic_year) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query(
    "SELECT id FROM fees WHERE student_id=? AND academic_year=?",
    [student_id, academic_year],
    (err, rows) => {
      if (rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Fees already set" });
      }

      db.query(
        `
        INSERT INTO fees 
        (student_id, total_amount, paid_amount, pending_amount, academic_year)
        VALUES (?, ?, 0, ?, ?)
        `,
        [student_id, total_amount, total_amount, academic_year],
        () =>
          res.json({
            success: true,
            message: "Fees created successfully",
          })
      );
    }
  );
};

/* ================= ADMIN: ADD PAYMENT ================= */
export const addPayment = (req, res) => {
  const { student_id, amount, payment_mode } = req.body;

  db.query(
    "SELECT pending_amount FROM fees WHERE student_id=?",
    [student_id],
    (err, rows) => {
      if (!rows.length)
        return res.status(404).json({ message: "Fees not found" });

      if (amount > rows[0].pending_amount)
        return res.status(400).json({ message: "Amount exceeds pending" });

      db.query(
        `
        INSERT INTO payments (student_id, amount, payment_mode)
        VALUES (?, ?, ?)
        `,
        [student_id, amount, payment_mode],
        () => {
          db.query(
            `
            UPDATE fees
SET paid_amount = paid_amount + ?,
    pending_amount = pending_amount - ?
WHERE student_id=?
ORDER BY id DESC
LIMIT 1

            `,
            [amount, amount, student_id],
            () =>
              res.json({
                success: true,
                message: "Payment added",
              })
          );
        }
      );
    }
  );
};

/* ================= STUDENT: FEES SUMMARY ================= */
export const studentFees = (req, res) => {
  db.query(
    `
    SELECT 
      f.total_amount,
      f.paid_amount,
      f.pending_amount
    FROM fees f
    JOIN students s ON f.student_id = s.id
    WHERE s.user_id = ?
    ORDER BY f.id DESC
    LIMIT 1
    `,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("studentFees error:", err);
        return res.status(500).json(err);
      }

      res.json(rows.length ? rows[0] : null);
    }
  );
};

/* ================= STUDENT: PAYMENT HISTORY ================= */
export const studentPayments = (req, res) => {
  db.query(
    `SELECT id FROM students WHERE user_id = ?`,
    [req.user.id],
    (err, studentRows) => {
      if (err) return res.status(500).json(err);
      if (!studentRows.length) return res.json([]);

      const studentId = studentRows[0].id;

      db.query(
        `
        SELECT amount, payment_mode, payment_date
        FROM payments
        WHERE student_id = ?
        ORDER BY payment_date DESC
        `,
        [studentId],
        (err, rows) => {
          if (err) {
            console.error("studentPayments error:", err);
            return res.status(500).json(err);
          }
          res.json(rows);
        }
      );
    }
  );
};




/* ================= ADMIN: FEES LIST ================= */
export const adminFeesList = (req, res) => {
  db.query(
    `
    SELECT u.name, s.standard,
           f.total_amount, f.paid_amount, f.pending_amount
    FROM fees f
    JOIN students s ON f.student_id = s.id
    JOIN users u ON s.user_id = u.id
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
