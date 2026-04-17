const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContactMessage = sequelize.define('ContactMessage', {
    contact_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Read', 'Replied'),
      defaultValue: 'Pending',
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'ContactMessages',
    timestamps: false,
    indexes: [
      {
        name: 'idx_contact_status',
        fields: ['status']
      },
      {
        name: 'idx_contact_created',
        fields: ['created_at']
      }
    ]
  });

  // Hooks to update updated_at
  ContactMessage.beforeUpdate((contactMessage) => {
    contactMessage.updated_at = new Date();
  });

  return ContactMessage;
};
