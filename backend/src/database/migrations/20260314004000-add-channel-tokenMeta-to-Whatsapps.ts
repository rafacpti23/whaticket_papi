import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Whatsapps", "channel", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "whatsapp"
      }),
      queryInterface.addColumn("Whatsapps", "tokenMeta", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Whatsapps", "channel"),
      queryInterface.removeColumn("Whatsapps", "tokenMeta")
    ]);
  }
};
