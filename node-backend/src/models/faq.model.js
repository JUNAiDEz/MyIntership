const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Faq = sequelize.define('Faq', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Question is required' }
      }
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Answer is required' }
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'SEO-friendly URL slug for FAQ',
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'General'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '1=active, 0=inactive'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'Faqs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_category',
        fields: ['category']
      },
      {
        name: 'idx_sort',
        fields: ['sort_order']
      }
    ]
  });

  // Hook to auto-generate slug from question if not provided
  Faq.beforeValidate((faq) => {
    if (faq.question && !faq.slug) {
      faq.slug = faq.question
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  });

  return Faq;
};
