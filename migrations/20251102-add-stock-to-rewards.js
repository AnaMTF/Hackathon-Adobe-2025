"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add stock column with a sensible default for existing rows.
    await queryInterface.addColumn('rewards', 'stock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
    });

    // Ensure no NULLs remain (defensive - most DBs will set default, but run a safety update).
    await queryInterface.sequelize.query("UPDATE rewards SET stock = 10 WHERE stock IS NULL");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rewards', 'stock');
  },
};
