import { db } from "../config/db.js";

export const revenueSummary = (req, res) => {
  db.query(
    `
    SELECT 
      IFNULL(SUM(amount), 0) AS total_collected
    FROM payments
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);

      db.query(
        `
        SELECT 
          IFNULL(SUM(pending_amount), 0) AS total_pending
        FROM fees
        `,
        (err2, rows2) => {
          if (err2) return res.status(500).json(err2);

          res.json({
            collected: rows[0].total_collected,
            pending: rows2[0].total_pending,
          });
        }
      );
    }
  );
};

export const monthlyRevenue = (req, res) => {
  db.query(
    `
    SELECT 
      MONTH(payment_date) AS month,
      SUM(amount) AS total
    FROM payments
    WHERE YEAR(payment_date) = YEAR(CURDATE())
    GROUP BY MONTH(payment_date)
    ORDER BY month
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
