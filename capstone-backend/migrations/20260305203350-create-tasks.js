'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      title: { type: Sequelize.STRING, allowNull: false },

      status: {
        type: Sequelize.ENUM('Open', 'Done', 'Snoozed'),
        allowNull: false,
        defaultValue: 'Open'
      },

      due_at: { type: Sequelize.DATE, allowNull: true },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
  }
};
