'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    // A contact is linked to a specific application.
    static associate(models) {
      Contact.belongsTo(models.Application, {
        foreignKey: 'application_id',
        as: 'application',
      });

      Contact.hasMany(models.Activity, {
        foreignKey: 'contact_id',
        as: 'activities',
      });
    }
  }

  // Represents a recruiter, hiring manager, or interviewer.
  Contact.init(
    {
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
      },

      email: {
        type: DataTypes.STRING,
      },

      phone: {
        type: DataTypes.STRING,
      },

      linkedin_url: {
        type: DataTypes.STRING,
      },

      contact_type: {
        type: DataTypes.ENUM('Recruiter', 'HiringManager', 'Interviewer', 'Other'),
        defaultValue: 'Other',
      },

      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Contact',
      tableName: 'Contacts',
      underscored: true,
    }
  );

  return Contact;
};
