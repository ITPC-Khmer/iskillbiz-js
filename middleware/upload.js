const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function userStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const userId = (req.authUser && req.authUser.id) || req.params.id;
      if (!userId) return cb(new Error('User id not resolved for upload'));
      const now = new Date();
      const parts = [
        'uploads',
        userId,
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ];
      const uploadPath = path.join(process.cwd(), ...parts);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname) || '.bin';
      cb(null, `${randomUUID()}${ext}`);
    }
  });
}

const uploadUserPhoto = multer({ storage: userStorage() }).single('photo');

module.exports = {
  uploadUserPhoto
};
