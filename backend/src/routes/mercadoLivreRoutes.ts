import express from "express";
import isAuth from "../middleware/isAuth";
import * as MercadoLivreController from "../controllers/MercadoLivreController";

const mercadoLivreRoutes = express.Router();

// OAuth - requires auth (user initiates connection)
mercadoLivreRoutes.get("/mercadolivre/auth", isAuth, MercadoLivreController.auth);

// OAuth callback - no auth required (ML redirects here)
mercadoLivreRoutes.get("/mercadolivre/callback", MercadoLivreController.authCallback);

// Webhook - no auth required (ML sends notifications here)
mercadoLivreRoutes.post("/mercadolivre/webhook", MercadoLivreController.webhook);

export default mercadoLivreRoutes;
