import { Request, Response } from "express";
import HandlePapiWebhookService from "../services/PapiService/HandlePapiWebhookService";

export const webhook = async (req: Request, res: Response): Promise<Response> => {
    const { instanceId } = req.params;
    const { type, event } = req.body;

    // PAPI uses 'type', but some versions might use 'event'.
    let eventName = type || event;

    // Map singular 'message' to 'messages' to match Service logic
    if (eventName === 'message') eventName = 'messages';

    console.log(`[PapiController] Webhook received for ${instanceId}. Event: ${eventName}`, JSON.stringify(req.body));

    try {
        await HandlePapiWebhookService(instanceId, eventName, req.body);
        return res.status(200).json({ message: "Webhook received" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
