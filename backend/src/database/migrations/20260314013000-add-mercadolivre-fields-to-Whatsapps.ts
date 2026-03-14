import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "mlUserId", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "mlAccessToken", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "mlRefreshToken", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "mlTokenExpiry", {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "mlUserId");
    await queryInterface.removeColumn("Whatsapps", "mlAccessToken");
    await queryInterface.removeColumn("Whatsapps", "mlRefreshToken");
    await queryInterface.removeColumn("Whatsapps", "mlTokenExpiry");
  }
};
