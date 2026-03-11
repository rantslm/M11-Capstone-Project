'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    // Applications belong to a User and contain
    // related Contacts, Activities, and Tasks.
    static associate(models) {
      // Each application belongs to one user
      Application.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // An application can have multiple contacts
      Application.hasMany(models.Contact, {
        foreignKey: 'application_id',
        as: 'contacts',
      });

      // An application can have multiple activities
      Application.hasMany(models.Activity, {
        foreignKey: 'application_id',
        as: 'activities',
      });

      // An application can have multiple tasks
      Application.hasMany(models.Task, {
        foreignKey: 'application_id',
        as: 'tasks',
      });
    }
  }

  // Represents a job application entry.
  // This is the central record in the system.
  Application.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      position_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Current progress stage of the application
      stage: {
        type: DataTypes.ENUM('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'),
        allowNull: false,
        defaultValue: 'Saved',
      },

      job_url: {
        type: DataTypes.STRING,
      },

      location: {
        type: DataTypes.STRING,
      },

      salary_min: {
        type: DataTypes.INTEGER,
      },

      salary_max: {
        type: DataTypes.INTEGER,
      },

      applied_at: {
        type: DataTypes.DATE,
      },

      notes: {
        type: DataTypes.TEXT,
      },
      // archive fields
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      archived_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      archive_reason: {
        type: DataTypes.ENUM(
          'Rejected',
          'Offer Declined',
          'Withdrawn',
          'Position Closed'
        ),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Application',
      tableName: 'Applications',
      underscored: true,
    }
  );

  return Application;
};
