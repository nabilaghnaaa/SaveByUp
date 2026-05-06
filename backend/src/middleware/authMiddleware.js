const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Format token tidak valid',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'savebyup_secret_key'
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
};

module.exports = authMiddleware;