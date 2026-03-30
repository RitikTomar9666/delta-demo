import jwt from "jsonwebtoken";

// ✅ FIX: req.header.authorization → req.headers.authorization (lowercase 's')
// Purana code kabhi bhi token nahi padh sakta tha — isliye sab protected routes fail hote the
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token found" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" se sirf token nikalo

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
