'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Activities', 'contact_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Contacts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Activities', 'contact_id');
  },
};
