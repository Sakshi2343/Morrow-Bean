import express from "express";
import {
  chatWithConcierge,
  getAdminIntelligenceDashboard,
  getBlindTastingFlight,
  getMyLimitOrders,
  getPersonalizedMatches,
  getPricingInsight,
  getSubscriptionPlan,
  createCustomRoast,
  streamMarketEvents,
  submitBlindTastingFlight,
  submitLimitOrder,
  runPricingEngine,
} from "../controllers/intelligenceController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/recommendations", authenticate, getPersonalizedMatches);
router.get("/subscription-plan", authenticate, getSubscriptionPlan);
router.get("/products/:id/pricing-insight", getPricingInsight);
router.get("/market-stream", streamMarketEvents);
router.get("/limit-orders/me", authenticate, getMyLimitOrders);
router.post("/products/:id/limit-orders", authenticate, submitLimitOrder);
router.post("/products/:id/custom-roast", authenticate, createCustomRoast);
router.get("/blind-tasting/challenge", authenticate, getBlindTastingFlight);
router.post("/blind-tasting/submit", authenticate, submitBlindTastingFlight);
router.post("/concierge", chatWithConcierge);
router.get("/dashboard", authenticate, authorizeAdmin, getAdminIntelligenceDashboard);
router.post("/pricing/run", authenticate, authorizeAdmin, runPricingEngine);

export default router;
