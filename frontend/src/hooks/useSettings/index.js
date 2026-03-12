import { useCallback } from "react";
import api, { openApi } from "../../services/api";

const useSettings = () => {
  const getAll = useCallback(async (params) => {
    const { data } = await api.request({
      url: "/settings",
      method: "GET",
      params,
    });
    return data;
  }, []);

  const update = useCallback(async (data) => {
    const { data: responseData } = await api.request({
      url: `/settings/${data.key}`,
      method: "PUT",
      data,
    });
    console.log(responseData);
    return responseData;
  }, []);

  const get = useCallback(async (param) => {
    const { data } = await api.request({
      url: `/setting/${param}`,
      method: "GET",
    });
    return data;
  }, []);

  const getPublicSetting = useCallback(async (key) => {
    const params = {
      token: "wtV"
    }

    const { data } = await openApi.request({
        url: `/public-settings/${key}`,
        method: 'GET',
        params
    });
    return data;
  }, []);

  return {
    getAll,
    update,
    get,
    getPublicSetting,
  };
};

export default useSettings;
