// packages
import path from "path";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import intelligenceRoutes from "./routes/intelligenceRoutes.js";
import { startIntelligenceWorker } from "./services/intelligenceWorker.js";

dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
const __dirname = path.resolve();
const configuredOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const normalizeOrigin = (origin = "") => origin.replace(/\/$/, "");

const isAllowedOrigin = (requestOrigin = "") => {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  return configuredOrigins.some((origin) => {
    const normalizedOrigin = normalizeOrigin(origin);

    if (normalizedOrigin === normalizedRequestOrigin) {
      return true;
    }

    if (normalizedOrigin.startsWith("https://*.") || normalizedOrigin.startsWith("http://*.")) {
      const wildcardSuffix = normalizedOrigin.replace("https://*.", ".").replace("http://*.", ".");
      return normalizedRequestOrigin.endsWith(wildcardSuffix);
    }

    return false;
  });
};

const allowVercelPreviewOrigin =
  process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === "true" &&
  /\.vercel\.app$/i.test(normalizeOrigin(process.env.CLIENT_URL || ""));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors((req, callback) => {
    const requestOrigin = req.get("origin");
    const requestHost = req.get("host");
    const requestProtocol =
      req.get("x-forwarded-proto") || (req.secure ? "https" : req.protocol);
    const sameOrigin = requestHost
      ? `${requestProtocol}://${requestHost}` === requestOrigin
      : false;

    const normalizedRequestOrigin = normalizeOrigin(requestOrigin || "");
    const isVercelPreviewOrigin =
      allowVercelPreviewOrigin && /\.vercel\.app$/i.test(normalizedRequestOrigin);

    if (
      !requestOrigin ||
      sameOrigin ||
      isAllowedOrigin(requestOrigin) ||
      isVercelPreviewOrigin
    ) {
      return callback(null, { origin: true, credentials: true });
    }

    return callback(new Error("Origin not allowed by CORS"));
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  "/api/users",
  (req, res, next) => {
    const isProtectedAuthRoute =
      req.method === "POST" && (req.path === "/" || req.path === "/auth");

    if (!isProtectedAuthRoute) {
      return next();
    }

    return authLimiter(req, res, next);
  },
  userRoutes
);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/intelligence", intelligenceRoutes);

app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const frontendDistPath = path.join(__dirname, "frontend", "dist");
const shouldServeFrontend =
  process.env.NODE_ENV === "production" && fs.existsSync(frontendDistPath);

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(frontendDistPath, "index.html"))
  );
}

const startServer = async () => {
  try {
    await connectDB();
    startIntelligenceWorker();
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();
