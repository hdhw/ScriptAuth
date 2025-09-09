const crypto = require('crypto');

const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password, salt) => {
  return crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
};

module.exports = {
  generateSalt,
  hashPassword
};
