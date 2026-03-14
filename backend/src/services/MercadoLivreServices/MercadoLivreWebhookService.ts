import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import { getMessages, getUserInfo, ensureValidToken, getOrder } from "./MercadoLivreApiService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

/**
 * Finds or creates a contact from a ML buyer
 */
const findOrCreateMLContact = async (
  buyerId: string,
  buyerName: string,
  companyId: number,
  whatsappId: number
): Promise<Contact> => {
  const contactNumber = `ml_${buyerId}`;

  let contact = await Contact.findOne({
    where: {
      number: contactNumber,
      companyId
    }
  });

  if (!contact) {
    contact = await Contact.create({
      name: buyerName || `Comprador ML ${buyerId}`,
      number: contactNumber,
      companyId,
      channel: "mercadolivre",
      isGroup: false,
      whatsappId
    });
  } else if (buyerName && contact.name !== buyerName) {
    await contact.update({ name: buyerName });
  }

  return contact;
};

/**
 * Process an incoming ML message notification
 */
export const handleMLNotification = async (
  notification: any
): Promise<void> => {
  const { resource, user_id, topic } = notification;

  if (topic !== "messages") {
    logger.info(`ML webhook: ignoring topic ${topic}`);
    return;
  }

  // Find the whatsapp connection for this ML user
  const whatsapp = await Whatsapp.findOne({
    where: {
      mlUserId: String(user_id),
      channel: "mercadolivre"
    }
  });

  if (!whatsapp) {
    logger.warn(`ML webhook: no connection found for user_id ${user_id}`);
    return;
  }

  try {
    const token = await ensureValidToken(whatsapp);

    // resource format: /packs/{pack_id}/sellers/{seller_id}/messages/{message_id}
    // or just get the resource directly
    const resourceParts = resource.split("/");
    const packId = resourceParts[2]; // /packs/{pack_id}/...

    // Fetch messages for this pack
    const messagesData = await getMessages(whatsapp, packId);
    const messages = messagesData?.messages || [];

    if (messages.length === 0) return;

    // Get the latest message that is NOT from the seller
    const incomingMessages = messages.filter(
      (m: any) => String(m.from?.user_id) !== String(whatsapp.mlUserId)
    );

    if (incomingMessages.length === 0) return;

    const latestMsg = incomingMessages[incomingMessages.length - 1];
    const buyerId = String(latestMsg.from?.user_id);

    // Get buyer info
    const buyerInfo = await getUserInfo(token, buyerId);
    const buyerName = buyerInfo
      ? `${buyerInfo.first_name || ""} ${buyerInfo.last_name || ""}`.trim()
      : `Comprador ${buyerId}`;

    // Find or create contact
    const contact = await findOrCreateMLContact(
      buyerId,
      buyerName,
      whatsapp.companyId,
      whatsapp.id
    );

    // Find or create ticket
    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp,
      0, // unreadMessages
      whatsapp.companyId,
      0 // queueId
    );

    // Check if message was already saved (by wid)
    const messageId = latestMsg.id || `ml_${packId}_${Date.now()}`;

    const messageData = {
      wid: String(messageId),
      ticketId: ticket.id,
      contactId: contact.id,
      body: latestMsg.text || "",
      fromMe: false,
      mediaType: latestMsg.attachments?.length > 0 ? "image" : "extendedTextMessage",
      read: false,
      quotedMsgId: null,
      ack: 1,
      remoteJid: `ml_${buyerId}`,
      participant: null,
      dataJson: JSON.stringify(latestMsg),
      ticketTrakingId: null,
      isPrivate: false
    };

    await CreateMessageService({
      messageData,
      companyId: whatsapp.companyId
    });

    logger.info(`ML webhook: message saved for pack ${packId}, buyer ${buyerId}`);
  } catch (err: any) {
    logger.error(`ML webhook processing error: ${err.message}`);
  }
};
