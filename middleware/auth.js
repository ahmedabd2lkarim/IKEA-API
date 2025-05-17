const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // the main code
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
  //  // // // // // // //////// 
  
  // teporary code
  // req.user = {
  //   id: "dummy-id",
  //   role: "admin", // This will give full access
  // };
  // next();
};

const isAdmin = (req, res, next) => {
  // main code
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
  ////////
  // teporary code
};

module.exports = { auth, isAdmin };
