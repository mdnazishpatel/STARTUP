const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.cookies.token; 
  if (!token) return res.status(401).json({ error: "Unauthorized, token missing" });

  jwt.verify(token, "sikandar123", (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden, invalid token" });
    req.user = user; 
    next();
  });
}

module.exports = authenticateToken;
