import axios from "axios";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

const PAPI_URL = process.env.PAPI_URL || "http://localhost:3003/api";
const PANEL_API_KEY = process.env.PAPI_API_KEY || "adminpro";

const api = axios.create({
    baseURL: PAPI_URL,
    headers: {
        "x-api-key": PANEL_API_KEY,
        "Content-Type": "application/json"
    }
});

interface SendMessageData {
    jid: string;
    text?: string;
    url?: string;
    caption?: string;
    type?: "text" | "image" | "video" | "audio" | "document";
    filename?: string;
    mimetype?: string;
}

const PapiService = {
    async createInstance(whatsapp: Whatsapp): Promise<void> {
        try {
            const { name } = whatsapp;
            console.log(`[PapiService] Creating instance: ${name}`);

            // 1. Create instance
            await api.post("/instances", { id: name });

            // 2. Configure Webhook
            const backendUrl = process.env.BACKEND_URL || "http://localhost:8081";
            // If backend is localhost, change to host.docker.internal for PAPI container to reach it
            const adjustedBackendUrl = backendUrl.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal");
            const webhookUrl = `${adjustedBackendUrl}/papi/webhook/${name}`;

            console.log(`[PapiService] Configuring webhook for ${name}: ${webhookUrl}`);
            await api.post(`/instances/${name}/webhook`, {
                url: webhookUrl,
                enabled: true,
                events: ["messages", "status", "connection"]
            });

            // 3. Get QR Code immediately to show in frontend with retry logic
            let qrCodeFetched = false;
            let retries = 0;
            const maxRetries = 3;

            while (!qrCodeFetched && retries < maxRetries) {
                try {
                    const { data: qrData } = await api.get(`/instances/${name}/qr`);
                    if (qrData?.qr) { // The PAPI documentation might imply 'qr' or 'base64' or 'qrcode'. Adjusting based on common PAPI structures.
                        await whatsapp.update({ qrcode: qrData.qr, status: "qrcode" });
                        qrCodeFetched = true;
                    } else if (qrData?.qrImage) {
                        await whatsapp.update({ qrcode: qrData.qrImage, status: "qrcode" });
                        qrCodeFetched = true;
                    }
                } catch (qrError) {
                    const errorMessage = qrError.response?.data?.error || qrError.message;
                    console.log(`[PapiService] Attempt ${retries + 1} to fetch QR failed:`, errorMessage);

                    // Check if already connected
                    if (typeof errorMessage === 'string' && (errorMessage.includes("connected") || errorMessage.includes("already connected"))) {
                        console.log(`[PapiService] Instance ${name} is already connected.`);
                        await whatsapp.update({ status: "CONNECTED", qrcode: "" });
                        qrCodeFetched = true; // Stop retrying
                    } else {
                        // Wait before next retry
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                }
                retries++;
            }

            const io = require("../../libs/socket").getIO();
            io.of(String(whatsapp.companyId))
                .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                });


        } catch (err) {
            console.error("Error creating PAPI instance:", err.response?.data || err.message);
        }
    },

    async getQrCode(whatsapp: Whatsapp): Promise<string | null> {
        try {
            const { data } = await api.get(`/instances/${whatsapp.name}/qr`);
            return data.qrImage;
        } catch (err) {
            console.error("Error fetching QR Code from PAPI:", err);
            return null;
        }
    },

    async getStatus(whatsapp: Whatsapp): Promise<any> {
        try {
            const { data } = await api.get(`/instances/${whatsapp.name}/status`);
            return data;
        } catch (err) {
            return { status: "DISCONNECTED" };
        }
    },

    async sendMessage(whatsapp: Whatsapp, content: SendMessageData): Promise<any> {
        const instanceId = whatsapp.name;
        const { jid, type, text, url, caption, filename, mimetype } = content;

        try {
            let endpoint = `/instances/${instanceId}/send-text`;
            let payload: any = { jid };

            if (type === "text") {
                endpoint = `/instances/${instanceId}/send-text`;
                payload.text = text;
            } else if (type === "image") {
                endpoint = `/instances/${instanceId}/send-image`;
                payload.url = url;
                payload.caption = caption;
            } else if (type === "video") {
                endpoint = `/instances/${instanceId}/send-video`;
                payload.url = url;
                payload.caption = caption;
            } else if (type === "audio") {
                endpoint = `/instances/${instanceId}/send-audio`;
                payload.url = url;
                payload.ptt = true; // Default to PTT for audio
            } else if (type === "document") {
                endpoint = `/instances/${instanceId}/send-document`;
                payload.url = url;
                payload.filename = filename;
                payload.mimetype = mimetype;
            }

            const { data } = await api.post(endpoint, payload);
            return data;
        } catch (err) {
            console.error("Error sending message via PAPI:", err);
            throw new AppError("ERR_SENDING_PAPI_MSG");
        }
    },

    async deleteInstance(whatsapp: Whatsapp): Promise<void> {
        try {
            await api.delete(`/instances/${whatsapp.name}`);
        } catch (err) {
            console.error("Error deleting PAPI instance:", err);
        }
    }
};

export default PapiService;
