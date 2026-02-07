import { QueryTypes } from "sequelize";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { join } from "path";
import fs from "fs";
import path from "path";
import axios from "axios";
import logger from "../../utils/logger";

const downloadProfileImage = async ({ profilePicUrl, companyId, filename }) => {
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        fs.chmodSync(folder, 0o777);
    }

    try {
        const response = await axios.get(profilePicUrl, {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(join(folder, filename), response.data);
    } catch (error) {
        console.error("Error downloading profile image", error);
        throw error;
    }
};

const SyncProfilePicsService = async (companyId: number): Promise<void> => {
    const defaultWhatsapp = await GetDefaultWhatsApp(null, companyId);

    if (!defaultWhatsapp) {
        logger.error("No default whatsapp found for company " + companyId);
        return;
    }

    const wbot = getWbot(defaultWhatsapp.id);

    if (!wbot) {
        logger.error("No wbot session found");
        return;
    }

    const contacts = await Contact.findAll({
        where: { companyId, channel: 'whatsapp' }
        // Poderia adicionar um filtro para apenas contatos sem foto ou antigos, mas o usuário pediu "atualizar".
    });

    console.log(`[SyncProfilePics] Starting sync for ${contacts.length} contacts`);

    for (const contact of contacts) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay para evitar bloqueio

            // Determina JID
            let remoteJid = contact.remoteJid;
            if (!remoteJid || !remoteJid.includes("@")) {
                const number = contact.number;
                remoteJid = contact.isGroup
                    ? (number.includes("@g.us") ? number : `${number}@g.us`)
                    : (number.includes("@s.whatsapp.net") ? number : `${number}@s.whatsapp.net`);
            }

            let profilePicUrl;
            try {
                profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
            } catch (e) {
                profilePicUrl = null; // Não encontrou foto ou erro (privacidade)
            }

            if (profilePicUrl && profilePicUrl !== contact.profilePicUrl) {
                const filename = `${new Date().getTime()}.jpeg`;

                await downloadProfileImage({ profilePicUrl, companyId, filename });

                await contact.update({
                    profilePicUrl,
                    urlPicture: filename,
                    pictureUpdated: true
                });
                console.log(`[SyncProfilePics] Updated photo for ${contact.name}`);
            } else if (!profilePicUrl) {
                // Se não tem foto, talvez remover a antiga? Melhor não, apenas logar.
                // console.log(`[SyncProfilePics] No photo for ${contact.name}`);
            }

        } catch (err) {
            console.error(`[SyncProfilePics] Error processing contact ${contact.id}:`, err);
        }
    }

    console.log(`[SyncProfilePics] Finished sync`);
};

export default SyncProfilePicsService;
