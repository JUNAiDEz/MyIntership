module.exports = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define('BlogPost', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' }
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT('long'), // 🔥 แก้จุดนี้จาก STRING(2048) เป็น TEXT('long') เพื่อรองรับ Base64
      allowNull: true
    },
    author: {
      type: DataTypes.STRING(100),
      defaultValue: 'GT7 MOTOR'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_published'
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'BlogPosts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_published',
        fields: ['is_published']
      },
      {
        name: 'idx_date',
        fields: ['published_at']
      }
    ]
  });

  // Hook to auto-generate slug from title if not provided
  BlogPost.beforeValidate((post) => {
    if (post.title && !post.slug) {
      post.slug = post.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  });

  // Hook to set published_at when is_published changes to true
  BlogPost.beforeUpdate((post) => {
    if (post.changed('is_published') && post.is_published && !post.published_at) {
      post.published_at = new Date();
    }
  });

  return BlogPost;
};