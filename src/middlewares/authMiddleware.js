import jwt from "jsonwebtoken";
export const protectRoute = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    //If token is there then verify it
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifiedToken);
    req.user = { id: verifiedToken.sub };
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token Expired" });
    }
    return res.status(401).json({ message: "Invalid Token" });
  }
};
