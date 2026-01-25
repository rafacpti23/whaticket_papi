import { WAMessage } from "whaileys";
import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateMessageService, { MessageData } from "../MessageServices/CreateMessageService";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import formatBody from "../../helpers/Mustache";
import CompaniesSettings from "../../models/CompaniesSettings";

interface PapiWebhookData {
    event: "messages.upsert" | "messages.update" | "connection.update";
    payload: any;
    instanceId: string;
}

const HandlePapiWebhookService = async (
    instanceId: string,
    event: string,
    payload: any
): Promise<void> => {
    console.log(`[PAPI] Webhook received: ${event} for ${instanceId}`);

    // Find connection by name (which effectively is instanceId in our logic)
    // Include queues to use default queue if needed
    const whatsapp = await Whatsapp.findOne({
        where: { name: instanceId, channel: "papi" },
        include: ["queues", "whatsappQueues"]
    });

    if (!whatsapp) {
        console.error(`[PAPI] Connection not found for instance: ${instanceId}`);
        return;
    }

    if (event === "messages") {
        const msg = payload.data;
        if (!msg || !msg.message) return;

        const isFromMe = msg.key.fromMe;
        const remoteJid = msg.key.remoteJid;
        const remoteJidAlt = msg.key.remoteJidAlt;

        if (!remoteJid) return;

        // Skip status broadcast
        if (remoteJid === "status@broadcast") return;

        const numberJid = remoteJidAlt && remoteJidAlt.includes("@s.whatsapp.net") ? remoteJidAlt : remoteJid;

        const contactData = {
            name: msg.pushName || numberJid.split("@")[0],
            number: numberJid.replace(/\D/g, ""),
            isGroup: remoteJid.includes("g.us"),
            companyId: whatsapp.companyId,
            channel: "papi",
            remoteJid: remoteJid
        };

        const contact = await CreateOrUpdateContactService(contactData);

        // Get default queue if any
        const defaultQueue = whatsapp.whatsappQueues?.[0]?.queueId || null;

        const settings = await CompaniesSettings.findOne({
            where: { companyId: whatsapp.companyId }
        });

        const ticket = await FindOrCreateTicketService(
            contact,
            whatsapp,
            0,
            whatsapp.companyId,
            defaultQueue,
            null,
            null,
            "papi",
            false,
            false,
            settings
        );

        // Extract body
        let body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";

        const messageData: MessageData = {
            wid: msg.key.id,
            ticketId: ticket.id,
            contactId: isFromMe ? undefined : contact.id,
            body: body,
            fromMe: isFromMe,
            read: isFromMe,
            mediaType: Object.keys(msg.message)[0],
            mediaUrl: "",
            ack: isFromMe ? 2 : 0,
            channel: "papi"
        };

        await CreateMessageService({ messageData, companyId: whatsapp.companyId });
    }

    if (event === "connection") {
        const { connection, qr } = payload.data || {};
        const io = getIO();
        let changed = false;

        if (connection === "open" && whatsapp.status !== "CONNECTED") {
            await whatsapp.update({ status: "CONNECTED", qrcode: "" });
            changed = true;
        } else if (connection === "close" && whatsapp.status !== "DISCONNECTED") {
            await whatsapp.update({ status: "DISCONNECTED" });
            changed = true;
        } else if (qr && whatsapp.qrcode !== qr) {
            await whatsapp.update({ qrcode: qr, status: "qrcode" });
            changed = true;
        }

        if (changed) {
            console.log(`[PAPI] Connection status changed for ${instanceId}: ${whatsapp.status}`);
            io.of(String(whatsapp.companyId))
                .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp.toJSON()
                });
        }
    }
};

export default HandlePapiWebhookService;
