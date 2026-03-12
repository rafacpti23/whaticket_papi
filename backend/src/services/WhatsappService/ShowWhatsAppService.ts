import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Chatbot from "../../models/Chatbot";
import { FindOptions } from "sequelize/types";
import Prompt from "../../models/Prompt";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import cacheLayer from "../../libs/cache";

const ShowWhatsAppService = async (
  id: string | number,
  companyId: number,
  session?: any
): Promise<Whatsapp> => {
  const cacheKey = `showwhatsapp:${id}:${companyId}:${session}`;
  const cached = await cacheLayer.get(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    const cachedWhatsapp = Whatsapp.build(data, { isNewRecord: false });
    if (data.queues) cachedWhatsapp.queues = data.queues;
    if (data.prompt) cachedWhatsapp.prompt = data.prompt;
    return cachedWhatsapp;
  }

  const findOptions: FindOptions = {
    include: [
      {
        model: FlowBuilderModel,
      },
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage", "integrationId", "fileListId", "closeTicket"],
        include: [
          {
            model: Chatbot,
            as: "chatbots",
            attributes: ["id", "name", "greetingMessage", "closeTicket"]
          }
        ]
      },
      {
        model: Prompt,
        as: "prompt",
        attributes: ["id", "name"]
      }
    ],
    order: [
      ["queues", "orderQueue", "ASC"],
      ["queues", "chatbots", "id", "ASC"]
    ]
  };

  if (session !== undefined && session == 0) {
    findOptions.attributes = { exclude: ["session"] };
  }

  const whatsapp = await Whatsapp.findByPk(id, findOptions);

  if (whatsapp?.companyId !== companyId) {
    throw new AppError("Não é possível acessar registros de outra empresa");
  }

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await cacheLayer.set(cacheKey, JSON.stringify(whatsapp.toJSON()), "EX", 3600);

  return whatsapp;
};

export default ShowWhatsAppService;
