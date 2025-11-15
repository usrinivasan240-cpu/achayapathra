const crypto = require('crypto');

const generateTokenNumber = () => {
  const randomSegment = crypto.randomInt(100, 999);
  const timestampSegment = Date.now().toString().slice(-3);
  return `TN${timestampSegment}${randomSegment}`;
};

module.exports = generateTokenNumber;
