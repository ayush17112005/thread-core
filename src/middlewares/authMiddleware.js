import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors/customErrors.js";

export const protectRoute = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }
    //If token is there then verify it
    const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log(verifiedToken);
    req.user = { id: verifiedToken.sub };
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token has expired"));
    }
    if (e instanceof UnauthorizedError) {
      return next(e);
    }
    return next(new UnauthorizedError("Invalid token"));
  }
};
