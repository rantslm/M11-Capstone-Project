'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * A Task belongs to one Application.
     */
    static associate(models) {
      Task.belongsTo(models.Application, {
        foreignKey: 'application_id',
        as: 'application',
      });
    }
  }

  Task.init(
    {
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Open', 'Done', 'Snoozed'),
        allowNull: false,
        defaultValue: 'Open',
      },
      due_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'Tasks',
      underscored: true,
    }
  );

  return Task;
};
