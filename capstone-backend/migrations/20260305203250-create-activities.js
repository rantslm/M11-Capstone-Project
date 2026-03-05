'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      type: {
        type: Sequelize.ENUM('Email', 'Call', 'Interview', 'Note'),
        allowNull: false
      },

      occurred_at: { type: Sequelize.DATE, allowNull: false },
      summary: { type: Sequelize.STRING, allowNull: false },
      details: { type: Sequelize.TEXT, allowNull: true },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Activities');
  }
};
