import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_name_unaccent_idx" ON "Contacts" (unaccent(lower(name)));');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_number_idx" ON "Contacts" (number);');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_companyid_idx" ON "Contacts" ("companyId");');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_name_unaccent_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_number_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_companyid_idx";');
  }
};
