import { db } from "../config/db.js";

export const adminStats = (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) total FROM students", (e1, r1) => {
    stats.students = r1[0].total;

    db.query("SELECT COUNT(*) total FROM teachers", (e2, r2) => {
      stats.teachers = r2[0].total;

      db.query(
        "SELECT COUNT(*) total FROM attendance WHERE date = CURDATE() AND status='present'",
        (e3, r3) => {
          stats.presentToday = r3[0].total;
          res.json(stats);
        }
      );
    });
  });
};


/* ================= TOTAL COLLECTION ================= */
export const totalRevenue = (req, res) => {
  db.query(
    `
    SELECT 
      IFNULL(SUM(paid_amount),0) AS total_paid,
      IFNULL(SUM(pending_amount),0) AS total_pending
    FROM fees
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows[0]);
    }
  );
};

/* ================= MONTHLY REVENUE ================= */
export const monthlyRevenue = (req, res) => {
  db.query(
    `
    SELECT 
      MONTH(created_at) AS month,
      SUM(amount) AS total
    FROM payments
    WHERE YEAR(created_at) = YEAR(CURDATE())
    GROUP BY MONTH(created_at)
    ORDER BY month
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};

