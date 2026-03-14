import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Prompt from "../../models/Prompt";

interface Request {
  companyId: number;
  session?: number | string;
}

const ListWhatsAppsService = async ({
  session,
  companyId
}: Request): Promise<Whatsapp[]> => {
  const options: FindOptions = {
    where: {
      companyId
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
      {
        model: Prompt,
        as: "prompt",
      }
    ]
  };

  if (session !== undefined && session == 0) {
    options.attributes = { exclude: ["session"] };
  }

  console.log("ListWhatsAppsService input:", { companyId, session });
  const whatsapps = await Whatsapp.findAll(options);
  console.log("ListWhatsAppsService found:", whatsapps.length);

  return whatsapps;
};



export default ListWhatsAppsService;
