import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { getIO } from "../libs/socket";
import logger from "../utils/logger";
import {
  getAuthUrl,
  exchangeCode
} from "../services/MercadoLivreServices/MercadoLivreApiService";
import { handleMLNotification } from "../services/MercadoLivreServices/MercadoLivreWebhookService";

/**
 * Initiates the OAuth flow — redirects user to ML authorization page
 */
export const auth = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.query;
  const { companyId } = req.user;

  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI || `${process.env.BACKEND_URL}/mercadolivre/callback`;

  if (!appId) {
    return res.status(400).json({ error: "ML_APP_ID não configurado nas variáveis de ambiente." });
  }

  // Use whatsappId as state to identify the connection on callback
  const state = `${companyId}_${whatsappId}`;
  const url = getAuthUrl(appId, redirectUri, state);

  return res.status(200).json({ url });
};

/**
 * OAuth callback — exchanges code for tokens and saves to the Whatsapp connection
 */
export const authCallback = async (req: Request, res: Response): Promise<Response | void> => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Código de autorização ou state ausente." });
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = process.env.ML_REDIRECT_URI || `${process.env.BACKEND_URL}/mercadolivre/callback`;

  if (!appId || !clientSecret) {
    return res.status(400).json({ error: "ML_APP_ID ou ML_CLIENT_SECRET não configurados." });
  }

  try {
    const [companyId, whatsappId] = (state as string).split("_");

    const tokenData = await exchangeCode(
      code as string,
      appId,
      clientSecret,
      redirectUri
    );

    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, companyId: Number(companyId) }
    });

    if (!whatsapp) {
      return res.status(404).json({ error: "Conexão não encontrada." });
    }

    await whatsapp.update({
      mlUserId: String(tokenData.user_id),
      mlAccessToken: tokenData.access_token,
      mlRefreshToken: tokenData.refresh_token,
      mlTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
      status: "CONNECTED"
    });

    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      });

    // Redirect to frontend connections page
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4000";
    return res.redirect(`${frontendUrl}/connections`);
  } catch (err: any) {
    logger.error(`ML OAuth callback error: ${err.message}`);
    return res.status(500).json({ error: "Erro ao conectar com Mercado Livre." });
  }
};

/**
 * Webhook endpoint — receives ML notifications
 */
export const webhook = async (req: Request, res: Response): Promise<Response> => {
  const notification = req.body;

  logger.info(`ML webhook received: ${JSON.stringify(notification)}`);

  // ML sends a POST with notification data
  // Respond immediately with 200 to acknowledge
  res.status(200).send("OK");

  // Process the notification asynchronously
  try {
    await handleMLNotification(notification);
  } catch (err: any) {
    logger.error(`ML webhook processing error: ${err.message}`);
  }

  return;
};
