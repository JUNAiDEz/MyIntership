// src/models/servicePreview.model.js
module.exports = (sequelize, Sequelize) => {
    const ServicePreview = sequelize.define("ServicePreview", { // เปลี่ยนเป็น PascalCase ให้ตรงกับ db.ServicePreview
        service_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true 
        },
        page_config: {
            type: Sequelize.JSON, 
            allowNull: false
        },
        last_updated_by: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        tableName: 'ServicePreviews', // ✅ ต้องตรงกับชื่อใน MySQL ที่คุณเพิ่งสร้าง
        timestamps: true 
    });

    return ServicePreview;
};