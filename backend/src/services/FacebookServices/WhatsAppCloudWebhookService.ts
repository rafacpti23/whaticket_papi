import Whatsapp from "../../models/Whatsapp";
import { verifyContact, verifyMessageFace } from "./facebookMessageListener";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CompaniesSettings from "../../models/CompaniesSettings";
import { Mutex } from "async-mutex";
import logger from "../../utils/logger";

export const handleCloudMessage = async (
  whatsapp: Whatsapp,
  changes: any
): Promise<void> => {
  try {
    const value = changes[0]?.value;
    if (!value || !value.messages) return;

    const companyId = whatsapp.companyId;

    for (const message of value.messages) {
      const contactInfo = value.contacts?.find((c: any) => c.wa_id === message.from);
      const msgContact = {
        id: message.from,
        name: contactInfo?.profile?.name || message.from,
        profile_pic: "" 
      };

      const contact = await verifyContact(msgContact, whatsapp, companyId);
      
      const settings = await CompaniesSettings.findOne({
        where: { companyId }
      });

      const mutex = new Mutex();
      const ticket = await mutex.runExclusive(async () => {
         return await FindOrCreateTicketService(
          contact,
          whatsapp,
          1,
          companyId,
          0,
          0,
          null,
          "whatsapp_cloud",
          null,
          false,
          settings
        );
      });

      if (message.type === "text") {
          // Adapt Cloud API payload to match verifyMessageFace expectations if possible, 
          // or pass body directly.
          const msgData = {
              mid: message.id,
              text: message.text.body,
              timestamp: message.timestamp
          };
          await verifyMessageFace(msgData, message.text.body, ticket, contact);
      } else if (["image", "video", "audio", "document"].includes(message.type)) {
          // TODO: Implement media ID resolution and download
          logger.info(`WhatsApp Cloud Media message received: ${message.type}. Media ID: ${message[message.type].id}`);
          const msgData = {
            mid: message.id,
            text: `Media ${message.type} received`,
            timestamp: message.timestamp
          };
          await verifyMessageFace(msgData, `Mensagem de mídia (${message.type}) recebida.`, ticket, contact);
      }
    }
  } catch (err) {
    logger.error(`Error handling WhatsApp Cloud Webhook: ${err}`);
  }
};
