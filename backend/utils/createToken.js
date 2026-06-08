import jwt from "jsonwebtoken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, getCookieOptions());

  return token;
};

export { getCookieOptions };
export default generateToken;
