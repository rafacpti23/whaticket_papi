
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,
  { host: process.env.DB_HOST || '127.0.0.1', port: process.env.DB_PORT || 5432, dialect: process.env.DB_DIALECT || 'postgres', logging: false }
);

async function patch() {
  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();
    const tableInfo = await qi.describeTable('Whatsapps');

    const cols = [
      ['mlUserId', DataTypes.TEXT],
      ['mlAccessToken', DataTypes.TEXT],
      ['mlRefreshToken', DataTypes.TEXT],
      ['mlTokenExpiry', DataTypes.DATE]
    ];

    for (const [name, type] of cols) {
      if (!tableInfo[name]) {
        console.log(`Adding '${name}'...`);
        await qi.addColumn('Whatsapps', name, { type, allowNull: true });
      } else {
        console.log(`'${name}' already exists.`);
      }
    }

    console.log("ML patch completed!");
  } catch (err) { console.error(err.message); }
  finally { await sequelize.close(); }
}
patch();
