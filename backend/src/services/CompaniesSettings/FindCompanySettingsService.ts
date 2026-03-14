/** 
 * @TercioSantos-0 |
 * serviço/todas as configurações de 1 empresa |
 * @param:companyId
 */
import CompaniesSettings from "../../models/CompaniesSettings";
import cacheLayer from "../../libs/cache";

interface Request {
  companyId: number;
};

const FindCompanySettingsService = async ({
  companyId
}: Request): Promise<CompaniesSettings | null> => {
  const cacheKey = `companysettings:${companyId}`;
  const cached = await cacheLayer.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const companySettings = await CompaniesSettings.findOne({
    where: { companyId }
  });

  if (companySettings) {
    await cacheLayer.set(cacheKey, JSON.stringify(companySettings), "EX", 3600);
  }

  return companySettings;
};

export default FindCompanySettingsService;