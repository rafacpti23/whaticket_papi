import axios, { AxiosInstance } from "axios";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import logger from "../../utils/logger";

const ML_API_BASE = "https://api.mercadolibre.com";

const getApi = (token: string): AxiosInstance =>
  axios.create({
    baseURL: ML_API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

/**
 * Generates the OAuth authorization URL for Mercado Livre
 */
export const getAuthUrl = (appId: string, redirectUri: string, state: string): string => {
  return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
};

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export const exchangeCode = async (
  code: string,
  appId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number; user_id: number }> => {
  try {
    const { data } = await axios.post(`${ML_API_BASE}/oauth/token`, {
      grant_type: "authorization_code",
      client_id: appId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    });
    return data;
  } catch (err: any) {
    logger.error(`ML OAuth exchange error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_OAUTH_EXCHANGE");
  }
};

/**
 * Refreshes an expired token
 */
export const refreshAccessToken = async (
  whatsapp: Whatsapp,
  appId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> => {
  try {
    const { data } = await axios.post(`${ML_API_BASE}/oauth/token`, {
      grant_type: "refresh_token",
      client_id: appId,
      client_secret: clientSecret,
      refresh_token: whatsapp.mlRefreshToken
    });

    // Update the stored tokens
    await whatsapp.update({
      mlAccessToken: data.access_token,
      mlRefreshToken: data.refresh_token,
      mlTokenExpiry: new Date(Date.now() + data.expires_in * 1000)
    });

    return data;
  } catch (err: any) {
    logger.error(`ML token refresh error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_TOKEN_REFRESH");
  }
};

/**
 * Ensures the token is valid, refreshing if needed
 */
export const ensureValidToken = async (whatsapp: Whatsapp): Promise<string> => {
  const now = new Date();
  const expiry = whatsapp.mlTokenExpiry ? new Date(whatsapp.mlTokenExpiry) : null;

  if (expiry && expiry > now) {
    return whatsapp.mlAccessToken;
  }

  // Token expired, refresh it
  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    throw new AppError("ERR_ML_MISSING_ENV_VARS");
  }

  const result = await refreshAccessToken(whatsapp, appId, clientSecret);
  return result.access_token;
};

/**
 * Sends a text message to a buyer via pack_id
 */
export const sendMessage = async (
  whatsapp: Whatsapp,
  packId: string,
  text: string
): Promise<any> => {
  const token = await ensureValidToken(whatsapp);
  const api = getApi(token);

  try {
    const { data } = await api.post(`/packs/${packId}/seller/${whatsapp.mlUserId}/messages`, {
      text
    });
    return data;
  } catch (err: any) {
    // Try alternative endpoint (messages by order)
    try {
      const { data } = await api.post(`/messages/packs/${packId}/sellers/${whatsapp.mlUserId}`, {
        from: { user_id: whatsapp.mlUserId },
        text
      });
      return data;
    } catch (err2: any) {
      logger.error(`ML send message error: ${JSON.stringify(err2.response?.data || err2.message)}`);
      throw new AppError("ERR_ML_SEND_MSG");
    }
  }
};

/**
 * Sends an attachment to a buyer
 */
export const sendAttachment = async (
  whatsapp: Whatsapp,
  packId: string,
  filePath: string,
  fileName: string
): Promise<any> => {
  const token = await ensureValidToken(whatsapp);
  const FormData = require("form-data");
  const fs = require("fs");

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), fileName);

  try {
    const { data } = await axios.post(
      `${ML_API_BASE}/packs/${packId}/seller/${whatsapp.mlUserId}/attachments`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  } catch (err: any) {
    logger.error(`ML send attachment error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_SEND_ATTACHMENT");
  }
};

/**
 * Get messages for a specific pack
 */
export const getMessages = async (
  whatsapp: Whatsapp,
  packId: string
): Promise<any> => {
  const token = await ensureValidToken(whatsapp);
  const api = getApi(token);

  try {
    const { data } = await api.get(`/messages/packs/${packId}/sellers/${whatsapp.mlUserId}?mark_as_read=false`);
    return data;
  } catch (err: any) {
    logger.error(`ML get messages error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_GET_MSGS");
  }
};

/**
 * Get pending (unread) messages
 */
export const getPendingMessages = async (
  whatsapp: Whatsapp
): Promise<any> => {
  const token = await ensureValidToken(whatsapp);
  const api = getApi(token);

  try {
    const { data } = await api.get(`/messages/unread?role=seller&mark_as_read=false`);
    return data;
  } catch (err: any) {
    logger.error(`ML get pending error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_GET_PENDING");
  }
};

/**
 * Get order details by order ID
 */
export const getOrder = async (
  whatsapp: Whatsapp,
  orderId: string
): Promise<any> => {
  const token = await ensureValidToken(whatsapp);
  const api = getApi(token);

  try {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  } catch (err: any) {
    logger.error(`ML get order error: ${JSON.stringify(err.response?.data || err.message)}`);
    throw new AppError("ERR_ML_GET_ORDER");
  }
};

/**
 * Get user info by user ID
 */
export const getUserInfo = async (
  token: string,
  userId: string
): Promise<any> => {
  const api = getApi(token);

  try {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  } catch (err: any) {
    logger.error(`ML get user error: ${JSON.stringify(err.response?.data || err.message)}`);
    return null;
  }
};
