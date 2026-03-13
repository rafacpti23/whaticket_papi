import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION immutable_unaccent(text)
      RETURNS text
      LANGUAGE sql
      IMMUTABLE
      PARALLEL SAFE
      AS $$
        SELECT public.unaccent('public.unaccent', $1)
      $$;
    `);
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_name_unaccent_idx" ON "Contacts" (immutable_unaccent(lower(name)));');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_number_idx" ON "Contacts" (number);');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "contacts_companyid_idx" ON "Contacts" ("companyId");');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_name_unaccent_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_number_idx";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "contacts_companyid_idx";');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS immutable_unaccent(text);');
  }
};
