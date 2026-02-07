import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (
  number: string, companyId: number, isGroup: boolean = false
): Promise<string> => {
  const wahtsappList = await GetDefaultWhatsApp(null, companyId);

  const wbot = getWbot(wahtsappList.id);

  let numberArray;

  if (isGroup) {
    const jid = number.includes("@g.us") ? number : `${number}@g.us`;
    const grupoMeta = await wbot.groupMetadata(jid);
    numberArray = [
      {
        jid: grupoMeta.id,
        exists: true
      }
    ];
  } else {
    const jid = number.includes("@") ? number : `${number}@s.whatsapp.net`;
    numberArray = await wbot.onWhatsApp(jid);
  }

  const isNumberExit = numberArray;

  if (!isNumberExit || !isNumberExit[0]?.exists) {
    throw new AppError("Este número não está cadastrado no whatsapp");
  }

  return isGroup ? number.split("@")[0] : isNumberExit[0].jid.split("@")[0];
};

export default CheckContactNumber;