import axios from "axios";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import logger from "../../utils/logger";

const apiBase = (phoneId: string, token: string) =>
  axios.create({
    baseURL: `https://graph.facebook.com/v20.0/${phoneId}/`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

export const sendMessage = async (
  whatsapp: Whatsapp,
  messageData: any
): Promise<any> => {
  const { tokenMeta, facebookPageUserId: phoneId } = whatsapp;
  const { number, body, type, mediaUrl } = messageData;

  try {
    let data : any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: number,
    };

    if (type === "chat" || !type || type === "text") {
      data.type = "text";
      data.text = { preview_url: false, body };
    } else if (type === "image") {
      data.type = "image";
      data.image = { link: mediaUrl, caption: body };
    } else if (type === "video") {
      data.type = "video";
      data.video = { link: mediaUrl, caption: body };
    } else if (type === "audio") {
      data.type = "audio";
      data.audio = { link: mediaUrl };
    } else if (type === "document") {
      data.type = "document";
      data.document = { link: mediaUrl, caption: body };
    }

    const { data: response } = await apiBase(phoneId, tokenMeta).post("messages", data);
    return response;
  } catch (err: any) {
    logger.error(`Error sending WhatsApp Cloud message: ${err.response?.data || err.message}`);
    throw new AppError("ERR_SENDING_WABA_MSG");
  }
};

export const markSeen = async (
  whatsapp: Whatsapp,
  messageId: string
): Promise<void> => {
  const { tokenMeta, facebookPageUserId: phoneId } = whatsapp;

  try {
    await apiBase(phoneId, tokenMeta).post("messages", {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    });
  } catch (err: any) {
    logger.error(`Error marking WhatsApp Cloud message as seen: ${err.response?.data || err.message}`);
  }
};
