import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({
        message: "unauthorized access",
      });
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (e) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      return res.status(403).json({ message: "Token verification failed" });
    }
  }
};
export default verifyToken;
