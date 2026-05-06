const db = require('../config/db');

const calculateFoodStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'aman';
  let priority = 'rendah';

  if (diffDays < 0) {
    status = 'kedaluwarsa';
    priority = 'tidak_layak';
  } else if (diffDays <= 1) {
    status = 'mendekati_kedaluwarsa';
    priority = 'tinggi';
  } else if (diffDays <= 3) {
    status = 'mendekati_kedaluwarsa';
    priority = 'sedang';
  } else {
    status = 'aman';
    priority = 'rendah';
  }

  return {
    status,
    priority,
  };
};

const getFoods = async (req, res) => {
  try {
    const userId = req.user.id;

    const [foods] = await db.query(
      'SELECT * FROM foods WHERE user_id = ? ORDER BY expiry_date ASC',
      [userId]
    );

    return res.status(200).json({
      message: 'Data makanan berhasil diambil',
      data: foods,
    });
  } catch (error) {
    console.error('Get foods error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const getFoodById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [foods] = await db.query(
      'SELECT * FROM foods WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (foods.length === 0) {
      return res.status(404).json({
        message: 'Data makanan tidak ditemukan',
      });
    }

    return res.status(200).json({
      message: 'Detail makanan berhasil diambil',
      data: foods[0],
    });
  } catch (error) {
    console.error('Get food by id error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const createFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, quantity, unit, expiry_date } = req.body;

    if (!name || !quantity || !unit || !expiry_date) {
      return res.status(400).json({
        message: 'Nama makanan, jumlah, satuan, dan tanggal kedaluwarsa wajib diisi',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: 'Jumlah makanan harus lebih dari 0',
      });
    }

    const { status, priority } = calculateFoodStatus(expiry_date);

    await db.query(
      `INSERT INTO foods 
      (user_id, name, category, quantity, unit, expiry_date, status, priority) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        category || null,
        quantity,
        unit,
        expiry_date,
        status,
        priority,
      ]
    );

    return res.status(201).json({
      message: 'Data makanan berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Create food error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, quantity, unit, expiry_date } = req.body;

    if (!name || !quantity || !unit || !expiry_date) {
      return res.status(400).json({
        message: 'Nama makanan, jumlah, satuan, dan tanggal kedaluwarsa wajib diisi',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: 'Jumlah makanan harus lebih dari 0',
      });
    }

    const [existingFood] = await db.query(
      'SELECT * FROM foods WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingFood.length === 0) {
      return res.status(404).json({
        message: 'Data makanan tidak ditemukan',
      });
    }

    const { status, priority } = calculateFoodStatus(expiry_date);

    await db.query(
      `UPDATE foods 
       SET name = ?, category = ?, quantity = ?, unit = ?, expiry_date = ?, status = ?, priority = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        category || null,
        quantity,
        unit,
        expiry_date,
        status,
        priority,
        id,
        userId,
      ]
    );

    return res.status(200).json({
      message: 'Data makanan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update food error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [existingFood] = await db.query(
      'SELECT * FROM foods WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingFood.length === 0) {
      return res.status(404).json({
        message: 'Data makanan tidak ditemukan',
      });
    }

    await db.query(
      'DELETE FROM foods WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({
      message: 'Data makanan berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete food error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const getFoodSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [summary] = await db.query(
      `SELECT 
        COUNT(*) AS total_foods,
        SUM(CASE WHEN status = 'aman' THEN 1 ELSE 0 END) AS total_aman,
        SUM(CASE WHEN status = 'mendekati_kedaluwarsa' THEN 1 ELSE 0 END) AS total_mendekati,
        SUM(CASE WHEN status = 'kedaluwarsa' THEN 1 ELSE 0 END) AS total_kedaluwarsa,
        SUM(CASE WHEN priority = 'tinggi' THEN 1 ELSE 0 END) AS total_prioritas_tinggi,
        SUM(CASE WHEN priority = 'sedang' THEN 1 ELSE 0 END) AS total_prioritas_sedang,
        SUM(CASE WHEN priority = 'rendah' THEN 1 ELSE 0 END) AS total_prioritas_rendah
      FROM foods 
      WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      message: 'Ringkasan makanan berhasil diambil',
      data: summary[0],
    });
  } catch (error) {
    console.error('Get food summary error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodSummary,
};