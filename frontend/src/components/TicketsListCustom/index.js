import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { FixedSizeList as ListWindow } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";

import TicketListItem from "../TicketListItemCustom";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    ticketsListWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    ticketsList: {
        flex: 1,
        maxHeight: "100%",
        overflow: "hidden", 
        ...theme.scrollbarStyles,
        borderTop: "2px solid rgba(0, 0, 0, 0.12)",
    },

    noTicketsText: {
        textAlign: "center",
        color: "rgb(104, 121, 146)",
        fontSize: "14px",
        lineHeight: "1.4",
    },

    noTicketsTitle: {
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "600",
        margin: "0px",
    },

    noTicketsDiv: {
        display: "flex",
        margin: 40,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
}));

const ticketSortAsc = (a, b) => {
    if (a.updatedAt < b.updatedAt) return -1;
    if (a.updatedAt > b.updatedAt) return 1;
    return 0;
}

const ticketSortDesc = (a, b) => {
    if (a.updatedAt > b.updatedAt) return -1;
    if (a.updatedAt < b.updatedAt) return 1;
    return 0;
}

const reducer = (state, action) => {
    const sortDir = action.sortDir;
    
    if (action.type === "LOAD_TICKETS") {
        const newTickets = action.payload;

        if (Array.isArray(newTickets)) {
            newTickets.forEach((ticket) => {
                const ticketIndex = state.findIndex((t) => t.id === ticket.id);
                if (ticketIndex !== -1) {
                    state[ticketIndex] = ticket;
                    if (ticket.unreadMessages > 0) {
                        state.unshift(state.splice(ticketIndex, 1)[0]);
                    }
                } else {
                    state.push(ticket);
                }
            });
        }
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "RESET_UNREAD") {
        const ticketId = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state[ticketIndex].unreadMessages = 0;
        }

        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
        } else {
            state.unshift(ticket);
        }
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
            state.unshift(state.splice(ticketIndex, 1)[0]);
        } else {
            if (action.status === action.payload.status) {
                state.unshift(ticket);
            }
        }
        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_CONTACT") {
        const contact = action.payload;
        const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
        if (ticketIndex !== -1) {
            state[ticketIndex].contact = contact;
        }
        return [...state];
    }

    if (action.type === "DELETE_TICKET") {
        const ticketId = action.payload;
        const ticketIndex = state.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
            state.splice(ticketIndex, 1);
        }

        if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
            sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
        }

        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const Row = React.memo(({ index, style, data }) => {
    const { ticketsList, hasMore, setTabOpen, isItemLoaded } = data;
    
    if (!isItemLoaded(index)) {
        return (
            <div style={style}>
                <TicketsListSkeleton />
            </div>
        );
    }

    const ticket = ticketsList[index];
    if (!ticket) return null;

    return (
        <div style={style}>
            <TicketListItem
                ticket={ticket}
                key={ticket.id}
                setTabOpen={setTabOpen}
            />
        </div>
    );
});

const TicketsListCustom = (props) => {
    const {
        setTabOpen,
        status,
        searchParam,
        searchOnMessages,
        tags,
        users,
        showAll,
        selectedQueueIds,
        updateCount,
        style,
        whatsappIds,
        forceSearch,
        statusFilter,
        userFilter,
        sortTickets
    } = props;

    const classes = useStyles();
    const [pageNumber, setPageNumber] = useState(1);
    const [ticketsListState, dispatch] = useReducer(reducer, []);
    const { user, socket } = useContext(AuthContext);

    const { profile, queues } = user;
    const safeQueues = queues || [];
    const safeSelectedQueueIds = selectedQueueIds || [];
    const showTicketWithoutQueue = user.allTicket === 'enable';
    const companyId = user.companyId;

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [status, searchParam, dispatch, showAll, tags, users, forceSearch, selectedQueueIds, whatsappIds, statusFilter, sortTickets, searchOnMessages]);

    const { tickets, hasMore, loading } = useTickets({
        pageNumber,
        searchParam,
        status,
        showAll,
        searchOnMessages: searchOnMessages ? "true" : "false",
        tags: JSON.stringify(tags),
        users: JSON.stringify(users),
        queueIds: JSON.stringify(selectedQueueIds),
        whatsappIds: JSON.stringify(whatsappIds),
        statusFilter: JSON.stringify(statusFilter),
        userFilter,
        sortTickets
    });


    useEffect(() => {
        if (companyId) {
            dispatch({
                type: "LOAD_TICKETS",
                payload: tickets,
                status,
                sortDir: sortTickets
            });
        }
    }, [tickets]);

    useEffect(() => {
        const shouldUpdateTicket = ticket => {
            return (!ticket?.userId || ticket?.userId === user?.id || showAll) &&
                ((!ticket?.queueId && showTicketWithoutQueue) || safeSelectedQueueIds.indexOf(ticket?.queueId) > -1)
        }

        const notBelongsToUserQueues = (ticket) =>
            ticket.queueId && safeSelectedQueueIds.indexOf(ticket.queueId) === -1;

        const onCompanyTicketTicketsList = (data) => {
            if (data.action === "updateUnread") {
                dispatch({
                    type: "RESET_UNREAD",
                    payload: data.ticketId,
                    status: status,
                    sortDir: sortTickets
                });
            }
            if (data.action === "update" &&
                shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
                dispatch({
                    type: "UPDATE_TICKET",
                    payload: data.ticket,
                    status: status,
                    sortDir: sortTickets
                });
            }

            if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
                dispatch({
                    type: "DELETE_TICKET", payload: data.ticket?.id, status: status,
                    sortDir: sortTickets
                });
            }

            if (data.action === "delete") {
                dispatch({
                    type: "DELETE_TICKET", payload: data?.ticketId, status: status,
                    sortDir: sortTickets
                });

            }
        };

        const onCompanyAppMessageTicketsList = (data) => {
            if (data.action === "create" &&
                shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
                dispatch({
                    type: "UPDATE_TICKET_UNREAD_MESSAGES",
                    payload: data.ticket,
                    status: status,
                    sortDir: sortTickets
                });
            }
        };

        const onCompanyContactTicketsList = (data) => {
            if (data.action === "update" && data.contact) {
                dispatch({
                    type: "UPDATE_TICKET_CONTACT",
                    payload: data.contact,
                    status: status,
                    sortDir: sortTickets
                });
            }
        };

        const onConnectTicketsList = () => {
            if (status) {
                socket.emit("joinTickets", status);
            } else {
                socket.emit("joinNotification");
            }
        }

        socket.on("connect", onConnectTicketsList)
        socket.on(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
        socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
        socket.on(`company-${companyId}-contact`, onCompanyContactTicketsList);

        return () => {
            if (status) {
                socket.emit("leaveTickets", status);
            } else {
                socket.emit("leaveNotification");
            }
            socket.off("connect", onConnectTicketsList);
            socket.off(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
            socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
            socket.off(`company-${companyId}-contact`, onCompanyContactTicketsList);
        };

    }, [status, showAll, user, safeSelectedQueueIds, tags, users, profile, safeQueues, sortTickets, showTicketWithoutQueue]);

    const prevCountRef = React.useRef();

    const ticketsList = useMemo(() => {
        if (status && status !== "search") {
            return ticketsListState.filter(ticket => ticket.status === status);
        }
        return ticketsListState;
    }, [ticketsListState, status]);

    useEffect(() => {
        if (typeof updateCount === "function" && prevCountRef.current !== ticketsList.length) {
            updateCount(ticketsList.length);
            prevCountRef.current = ticketsList.length;
        }
    }, [ticketsList, updateCount]);

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const isItemLoaded = (index) => !hasMore || index < ticketsList.length;

    const itemData = useMemo(() => ({
        ticketsList,
        hasMore,
        setTabOpen,
        isItemLoaded
    }), [ticketsList, hasMore, setTabOpen]);

    return (
        <Paper className={classes.ticketsListWrapper} style={style}>
            <div className={classes.ticketsList}>
                {ticketsList.length === 0 && !loading ? (
                    <div className={classes.noTicketsDiv}>
                        <span className={classes.noTicketsTitle}>
                            {i18n.t("ticketsList.noTicketsTitle")}
                        </span>
                        <p className={classes.noTicketsText}>
                            {i18n.t("ticketsList.noTicketsMessage")}
                        </p>
                    </div>
                ) : (
                    <AutoSizer>
                        {({ height, width }) => (
                            <InfiniteLoader
                                isItemLoaded={isItemLoaded}
                                itemCount={hasMore ? ticketsList.length + 1 : ticketsList.length}
                                loadMoreItems={loading ? () => {} : loadMore}
                            >
                                {({ onItemsRendered, ref }) => (
                                    <ListWindow
                                        height={height}
                                        width={width}
                                        itemCount={hasMore ? ticketsList.length + 1 : ticketsList.length}
                                        itemSize={105}
                                        onItemsRendered={onItemsRendered}
                                        ref={ref}
                                        itemData={itemData}
                                    >
                                        {Row}
                                    </ListWindow>
                                )}
                            </InfiniteLoader>
                        )}
                    </AutoSizer>
                )}
                {loading && ticketsList.length === 0 && <TicketsListSkeleton />}
            </div>
        </Paper>
    );
};

export default TicketsListCustom;
