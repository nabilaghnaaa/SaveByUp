const db = require("../config/db");

const ensureFoodStockLogTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS food_stock_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      food_id INT NOT NULL,
      user_id INT NOT NULL,
      action ENUM('digunakan', 'dibuang', 'terjual', 'kedaluwarsa') NOT NULL,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
      note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const createStockLog = async ({
  foodId,
  userId,
  action,
  quantity,
  note = "",
}) => {
  await ensureFoodStockLogTable();

  const [result] = await db.query(
    `INSERT INTO food_stock_logs
     (
      food_id,
      user_id,
      action,
      quantity,
      note
     )
     VALUES (?, ?, ?, ?, ?)`,
    [foodId, userId, action, Number(quantity || 0), note]
  );

  return {
    id: result.insertId,
    food_id: Number(foodId),
    user_id: Number(userId),
    action,
    quantity: Number(quantity || 0),
    note,
  };
};

const getStockLogTotalsByUser = async (userId) => {
  await ensureFoodStockLogTable();

  const [rows] = await db.query(
    `SELECT
      COALESCE(
        SUM(
          CASE 
            WHEN action = 'digunakan' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_digunakan,

      COALESCE(
        SUM(
          CASE 
            WHEN action = 'dibuang' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_dibuang,

      COALESCE(
        SUM(
          CASE 
            WHEN action = 'terjual' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_terjual_log,

      COALESCE(
        SUM(
          CASE 
            WHEN action = 'kedaluwarsa' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_kedaluwarsa_log
     FROM food_stock_logs
     WHERE user_id = ?`,
    [userId]
  );

  return {
    total_digunakan: Number(rows[0]?.total_digunakan || 0),
    total_dibuang: Number(rows[0]?.total_dibuang || 0),
    total_terjual_log: Number(rows[0]?.total_terjual_log || 0),
    total_kedaluwarsa_log: Number(rows[0]?.total_kedaluwarsa_log || 0),
  };
};

const getCompletedTransactionStockBySeller = async (userId) => {
  const [rows] = await db.query(
    `SELECT
      COALESCE(SUM(t.quantity), 0) AS total_terjual
     FROM transactions t
     JOIN marketplace_products mp ON t.product_id = mp.id
     WHERE mp.seller_id = ?
     AND t.status IN ('selesai', 'completed', 'success', 'berhasil')`,
    [userId]
  );

  return Number(rows[0]?.total_terjual || 0);
};

module.exports = {
  createStockLog,
  getStockLogTotalsByUser,
  getCompletedTransactionStockBySeller,
};