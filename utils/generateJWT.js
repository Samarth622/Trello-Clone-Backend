import jwt from "jsonwebtoken";

const generateToken = (userId, email) => {
  const payload = { id: userId, email };
  const secret = process.env.JWT_SECRET;

  const options = { expiresIn: process.env.EXPIRES_IN };

  return jwt.sign(payload, secret, options);
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  return jwt.verify(token, secret);
};

export { generateToken, verifyToken };