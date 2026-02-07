import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

const GetProfilePicUrl = async (
  number: string,
  companyId: number,
  contact?: Contact,
): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(null, companyId);

  const wbot = getWbot(defaultWhatsapp.id);

  let profilePicUrl: string;
  try {
    const jid = contact && contact.isGroup
      ? (contact.remoteJid.includes("@g.us") ? contact.remoteJid : `${contact.remoteJid}@g.us`)
      : (number.includes("@s.whatsapp.net") ? number : `${number}@s.whatsapp.net`);

    profilePicUrl = await wbot.profilePictureUrl(jid, "image");
  } catch (error) {
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  return profilePicUrl;
};

export default GetProfilePicUrl;
