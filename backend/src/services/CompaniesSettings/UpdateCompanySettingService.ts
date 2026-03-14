/** 
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
import CompaniesSettings from "../../models/CompaniesSettings";
import cacheLayer from "../../libs/cache";

type Params = {
  companyId: number,
  column: string,
  data: string
};

const UpdateCompanySettingsService = async ({
  companyId,
  column,
  data
}: Params): Promise<any> => {
  let value: any = data;

  // Automagically convert frontend status strings to boolean if column expects boolean
  if (data === "enabled") value = true;
  if (data === "disabled") value = false;

  const [updatedCount] = await CompaniesSettings.update(
    { [column]: value },
    { where: { companyId } }
  );

  if (updatedCount > 0) {
    const cacheKey = `companysettings:${companyId}`;
    await cacheLayer.del(cacheKey);
  }

  return updatedCount;
};

export default UpdateCompanySettingsService;