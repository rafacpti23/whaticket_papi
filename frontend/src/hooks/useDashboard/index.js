import { useCallback } from "react";
import api from "../../services/api";

const useDashboard = () => {

    const find = useCallback(async (params) => {
        const { data } = await api.request({
            url: `/dashboard`,
            method: 'GET',
            params
        });
        return data;
    }, []);

    const getReport = useCallback(async (params) => {
        const { data } = await api.request({
            url: `/ticketreport/reports`,
            method: 'GET',
            params
        });
        return data;
    }, []);

    return {
        find,
        getReport
    }
}

export default useDashboard;