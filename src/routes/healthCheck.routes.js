import { Router } from "express";
import { healthcheck } from "../controllers/healthCheck.controller.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(jwtVerify)

router.route("/").get(healthcheck)

export { router }