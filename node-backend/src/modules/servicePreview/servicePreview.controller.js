// src/modules/servicePreview/servicePreview.controller.js
const db = require('../../models'); // ดึง Sequelize models มาใช้

// บันทึก หรือ อัปเดตโครงสร้างหน้า Preview
exports.savePreviewConfig = async (req, res) => {
    try {
        const { service_id, page_config } = req.body;
        let preview = await db.ServicePreview.findOne({ where: { service_id } });
        if (!preview) {
            preview = await db.ServicePreview.create({ service_id, page_config });
        } else {
            preview.page_config = page_config;
            await preview.save();
        }
        res.json({
            status: "success",
            message: "บันทึกโครงสร้างหน้า Preview สำเร็จ",
            data: preview.page_config
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error: ไม่สามารถบันทึกข้อมูลได้" });
    }
};

// ดึงข้อมูลไปแสดงผล
exports.getPreviewConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const preview = await db.ServicePreview.findOne({ where: { service_id: id } });
        if (!preview) {
            return res.status(404).json({ message: "ไม่พบข้อมูล" });
        }
        // ตอบกลับเป็น object เสมอ (ไม่ส่งแค่ JSON string)
        res.json({
            service_id: preview.service_id,
            page_config: preview.page_config
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};