/** 
 * @TercioSantos-0 |
 * serviço/todas as configurações de 1 empresa |
 * @param:companyId
 */
import FindCompanySettingsService from "./FindCompanySettingsService";

type Params = {
  companyId: number;
  column: string;
};

const FindCompanySettingOneService = async ({
  companyId,
  column
}: Params): Promise<any> => {
  const companySettings = await FindCompanySettingsService({ companyId });

  if (companySettings && column in companySettings) {
    return [{ [column]: (companySettings as any)[column] }];
  }

  return [];
};

export default FindCompanySettingOneService;