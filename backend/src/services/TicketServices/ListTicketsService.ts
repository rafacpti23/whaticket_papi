import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";

import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";

import removeAccents from "remove-accents";

import FindCompanySettingOneService from "../CompaniesSettings/FindCompanySettingOneService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId: number;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  contacts?: string[];
  updatedStart?: string;
  updatedEnd?: string;
  connections?: string[];
  whatsappIds?: number[];
  statusFilters?: string[];
  queuesFilter?: string[];
  isGroup?: string;
  companyId: number;
  allTicket?: string;
  sortTickets?: string;
  searchOnMessages?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  dateStart,
  dateEnd,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages = "false",
  whatsappIds,
  statusFilters,
  companyId,
  sortTickets = "DESC",
  searchOnMessages = "false"
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId, companyId);

  const showTicketAllQueues = user.allHistoric === "enabled";
  const showTicketWithoutQueue = user.allTicket === "enable";
  const showGroups = user.allowGroup === true;
  const showPendingNotification = await FindCompanySettingOneService({ companyId, column: "showNotificationPending" });
  const showNotificationPendingValue = showPendingNotification?.[0]?.showNotificationPending ?? false;
    let whereCondition: Filterable["where"];

  whereCondition = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : { [Op.or]: [queueIds] },
    companyId
  };


  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
      include: ["extraInfo", "tags"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
    },
  ];

  const userQueueIds = user.queues.map(queue => queue.id);

  if (status === "open") {
    whereCondition = {
      ...whereCondition,
      userId,
      queueId: { [Op.in]: queueIds }
    };
  } else if (status === "group" && user.allowGroup) {
    whereCondition = {
      companyId,
      queueId: { [Op.or]: [queueIds, null] },
      ...(user.whatsappId && { whatsappId: user.whatsappId })
    };
  } else if (user.profile === "user" && status === "pending") {
    whereCondition = {
      ...whereCondition,
      status: "pending",
      userId: { [Op.or]: [user.id, null] },
      ...(!showTicketAllQueues && {
        queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : { [Op.in]: queueIds }
      })
    };
  } else if (status === "closed") {
    let whereConditionClosed: Filterable["where"] = {
      companyId,
      status: "closed",
    };

    if (showAll === "false" && (user.profile === "admin" || user.allUserChat === "enabled")) {
      whereConditionClosed = { ...whereConditionClosed, queueId: queueIds, userId };
    } else {
      whereConditionClosed = {
        ...whereConditionClosed,
        queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
      };
    }

    const latestTickets = await Ticket.findAll({
      attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
      where: whereConditionClosed,
      group: ['companyId', 'contactId', 'whatsappId'],
    });

    whereCondition = { id: latestTickets.map((t) => t.id) };
  } else if (status === "search") {
    let whereConditionSearch: Filterable["where"] = {
      companyId,
      [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }]
    };

    if (user.profile === "admin" || user.allUserChat === "enabled") {
      if (showAll === "false") {
        whereConditionSearch = { ...whereConditionSearch, queueId: queueIds };
      } else {
        whereConditionSearch = { companyId, queueId: { [Op.or]: [queueIds, null] } };
      }
    } else if (!showTicketAllQueues) {
      whereConditionSearch = {
        ...whereConditionSearch,
        queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
      };
    }

    const latestTickets = await Ticket.findAll({
      attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
      where: whereConditionSearch,
      group: ['companyId', 'contactId', 'whatsappId'],
    });

    whereCondition = { ...whereCondition, id: latestTickets.map((t) => t.id) };

    if (searchParam) {
      const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
      if (searchOnMessages === "true") {
        includeCondition = [
          ...includeCondition,
          {
            model: Message,
            as: "messages",
            attributes: ["id", "body"],
            where: {
              body: where(
                fn("LOWER", fn('unaccent', col("body"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              ),
            },
            required: false,
            duplicating: false
          }
        ];
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              "$contact.name$": where(
                fn("LOWER", fn("unaccent", col("contact.name"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            },
            { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
            {
              "$message.body$": where(
                fn("LOWER", fn("unaccent", col("body"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            }
          ]
        };
      } else {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              "$contact.name$": where(
                fn("LOWER", fn("unaccent", col("contact.name"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            },
            { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
          ]
        };
      }
    }

    if (Array.isArray(tags) && tags.length > 0) {
      const contactTags = await ContactTag.findAll({
        where: { tagId: tags }
      });
      const contactsIntersection = contactTags.map(t => t.contactId);
      whereCondition = {
        ...whereCondition,
        contactId: contactsIntersection
      };
    }

    if (Array.isArray(users) && users.length > 0) {
      whereCondition = { ...whereCondition, userId: users };
    }

    if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
      whereCondition = { ...whereCondition, whatsappId: whatsappIds };
    }

    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      whereCondition = { ...whereCondition, status: { [Op.in]: statusFilters } };
    }
  } else if (withUnreadMessages === "true") {
    whereCondition = {
      [Op.or]: [
        {
          userId,
          status: showNotificationPendingValue ? { [Op.notIn]: ["closed", "lgpd", "nps"] } : { [Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
          queueId: { [Op.in]: userQueueIds },
          unreadMessages: { [Op.gt]: 0 },
          companyId,
          isGroup: showGroups ? { [Op.or]: [true, false] } : false
        },
        {
          status: showNotificationPendingValue ? { [Op.in]: ["pending", "group"] } : { [Op.in]: ["group"] },
          queueId: showTicketWithoutQueue ? { [Op.or]: [userQueueIds, null] } : { [Op.or]: [userQueueIds] },
          unreadMessages: { [Op.gt]: 0 },
          companyId,
          isGroup: showGroups ? { [Op.or]: [true, false] } : false
        }
      ]
    };

    if (status === "group" && (user.allowGroup || showAll === "true")) {
      whereCondition = {
        ...whereCondition,
        queueId: { [Op.or]: [userQueueIds, null] },
      };
    }
  }

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    attributes: ["id", "uuid", "userId", "queueId", "isGroup", "channel", "status", "contactId", "useIntegration", "lastMessage", "updatedAt", "unreadMessages"],
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", sortTickets]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
