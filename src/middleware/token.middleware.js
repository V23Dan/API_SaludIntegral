import jwt from "jsonwebtoken";

const secretKey = "clave-secreta";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
 
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next(); 
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token, authorization denied" });
  }
};
