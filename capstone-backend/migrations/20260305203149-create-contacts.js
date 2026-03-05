'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Contacts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      name: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      linkedin_url: { type: Sequelize.STRING, allowNull: true },

      contact_type: {
        type: Sequelize.ENUM('Recruiter', 'HiringManager', 'Interviewer', 'Other'),
        allowNull: false,
        defaultValue: 'Other'
      },

      notes: { type: Sequelize.TEXT, allowNull: true },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Contacts');
  }
};
