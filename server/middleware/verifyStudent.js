const jwt = require("jsonwebtoken");

module.exports = function verifyStudent(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded student info to request
    req.studentId = decoded.studentId;
    req.orgId = decoded.orgId;
    req.name = decoded.name;

    next();
  } catch (err) {
    console.error("Invalid student token:", err);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
