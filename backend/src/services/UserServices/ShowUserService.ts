import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import cacheLayer from "../../libs/cache";

const ShowUserService = async (id: string | number, companyId: string | number): Promise<User> => {
  const cacheKey = `showuser:${id}:${companyId}`;
  const cached = await cacheLayer.get(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    // Build a proper Sequelize instance and manually assign associations from JSON
    const cachedUser = User.build(data, { isNewRecord: false });
    // Manually assign associations that might not be populated by build()
    if (data.queues) cachedUser.queues = data.queues;
    if (data.company) cachedUser.company = data.company;
    return cachedUser;
  }

  const user = await User.findOne(
    {
      where: {
        id,
        companyId
      },
// ... (omitting lines for brevity in ReplacementContent but using them in the file)
      attributes: [
        "id",
        "name",
        "email",
        "profile",
        "profileImage",
        "super",
        "whatsappId",
        "online",
        "startWork",
        "endWork",
        "allTicket",
        "companyId",
        "tokenVersion",
        "defaultTheme",
        "allowGroup",
        "defaultMenu",
        "farewellMessage",
        "userClosePendingTicket",
        "showDashboard",
        "defaultTicketsManagerWidth",
        "allUserChat",
        "allHistoric",
        "allowRealTime",
        "allowConnections"
      ],
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "dueDate", "document"],
          include: [
            {
              model: Plan, as: "plan",
              attributes: ["id",
                "name",
                "amount",
                "useWhatsapp",
                "useFacebook",
                "useInstagram",
                "useCampaigns",
                "useSchedules",
                "useInternalChat",
                "useExternalApi",
                "useIntegrations",
                "useOpenAi",
                "useKanban"
              ]
            },
          ]
        },
      ]
    });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await cacheLayer.set(cacheKey, JSON.stringify(user.toJSON()), "EX", 3600);

  return user;
};

export default ShowUserService;
