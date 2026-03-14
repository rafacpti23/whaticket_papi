import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Basic performance indices that are guaranteed to work
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_name_lower_idx" ON "Contacts" (lower(name));');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_number_idx" ON "Contacts" (number);');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_companyid_idx" ON "Contacts" ("companyId");');
    
    // Attempt unaccent extension for future use, but don't depend on it for indexing right now
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
    } catch (e) {
      console.log("unaccent extension could not be enabled, skipping...");
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_name_lower_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_number_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_companyid_idx";');
  }
};
