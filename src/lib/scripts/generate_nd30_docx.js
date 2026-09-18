const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, convertInchesToTwip, BorderStyle, Footer, LineRuleType } = require('docx');

// Helper to create empty borders for tables
const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
};

async function createNd30Docx(jsonPath, outputPath) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Try loading config.json for default fallbacks
    let defaultConfig = {};
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configPath)) {
            defaultConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (e) {}

    // Apply defaults if fields are missing or empty
    data.co_quan_chu_quan = data.co_quan_chu_quan || defaultConfig.co_quan_chu_quan || "ỦY BAN NHÂN DÂN TỈNH PHÚ THỌ";
    data.co_quan_ban_hanh = data.co_quan_ban_hanh || defaultConfig.co_quan_ban_hanh || "UBND PHƯỜNG NÔNG TRANG";
    data.chuc_danh_nguoi_ky = data.chuc_danh_nguoi_ky || defaultConfig.chuc_danh_nguoi_ky || "CHỦ TỊCH";
    data.ten_nguoi_ky = data.ten_nguoi_ky || defaultConfig.ten_nguoi_ky || "Nguyễn Văn A";
    if (!data.dia_danh_ngay_thang) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const location = defaultConfig.dia_danh || "Phú Thọ";
        data.dia_danh_ngay_thang = `${location}, ngày ${dd} tháng ${mm} năm ${yyyy}`;
    }
    if (!data.noi_nhan || data.noi_nhan.length === 0) {
        data.noi_nhan = defaultConfig.noi_nhan_mac_dinh || [
            "Như Điều ...;",
            "UBND tỉnh Phú Thọ (để b/c);",
            "Tổ CĐS Trường ĐH Hùng Vương (phối hợp);",
            "Lưu: VT."
        ];
    }

    // Identify if it is an Official Letter (Công văn) - no document type name
    const isCongVan = !data.ten_loai_van_ban;

    // Header Table (Cơ quan & Quốc hiệu)
    const leftColumnChildren = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: (data.co_quan_chu_quan || '').toUpperCase(), font: "Times New Roman", size: 24 }), // 12pt
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: (data.co_quan_ban_hanh || '').toUpperCase(), font: "Times New Roman", size: 26, bold: true }), // 13pt
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "-------", font: "Times New Roman", size: 24 }) // Line under issuing body
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: data.so_ky_hieu || '', font: "Times New Roman", size: 26 })
            ]
        })
    ];

    // If Official Letter, Abstract goes under Số/Ký hiệu
    if (isCongVan && data.trich_yeu) {
        leftColumnChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: "V/v " + data.trich_yeu.replace(/^Về việc\s+/i, ''), font: "Times New Roman", size: 24 }) // 12pt for CV abstract
            ]
        }));
    }

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: leftColumnChildren
                    }),
                    new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", font: "Times New Roman", size: 24, bold: true })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", font: "Times New Roman", size: 26, bold: true })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "---------------", font: "Times New Roman", size: 24 })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 120 },
                                children: [
                                    new TextRun({ text: data.dia_danh_ngay_thang || '', font: "Times New Roman", size: 28, italics: true })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });

    const children = [headerTable];
    children.push(new Paragraph({ text: "" })); // Spacing

    // Tên loại văn bản (Only for Decisions, Reports, etc.)
    if (data.ten_loai_van_ban) {
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: data.ten_loai_van_ban.toUpperCase(), font: "Times New Roman", size: 28, bold: true })
            ]
        }));

        // Trích yếu for Decisions/Reports is centered and below type name
        if (data.trich_yeu) {
            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: data.trich_yeu, font: "Times New Roman", size: 28, bold: true })
                ]
            }));
            children.push(new Paragraph({ text: "" }));
        }
    }

    // Kính gửi (For Official Letter or Reports)
    if (data.kinh_gui) {
        children.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 1440 }, // Indented "Kính gửi"
            spacing: { before: 240, after: 120 },
            children: [
                new TextRun({ text: "Kính gửi: ", font: "Times New Roman", size: 28 }),
                new TextRun({ text: data.kinh_gui, font: "Times New Roman", size: 28 })
            ]
        }));
    }

    children.push(new Paragraph({ text: "" })); // Spacing

    // Căn cứ
    if (data.can_cu && data.can_cu.length > 0) {
        data.can_cu.forEach(cc => {
            children.push(new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 }, // 1.27cm
                spacing: { before: 120, after: 120, line: 320, lineRule: LineRuleType.EXACT }, // Before 6pt, After 6pt, Exactly 16pt
                children: [
                    new TextRun({ text: cc, font: "Times New Roman", size: 28, italics: true })
                ]
            }));
        });
    }

    // Nội dung
    if (data.noi_dung && data.noi_dung.length > 0) {
        data.noi_dung.forEach(block => {
            const paragraphChildren = [];
            if (block.loai === 'dieu' && block.tieu_de) {
                paragraphChildren.push(new TextRun({ text: block.tieu_de + ' ', font: "Times New Roman", size: 28, bold: true }));
            }
            if (block.noi_dung) {
                paragraphChildren.push(new TextRun({ text: block.noi_dung, font: "Times New Roman", size: 28 }));
            }

            children.push(new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 },
                spacing: { before: 120, after: 120, line: 320, lineRule: LineRuleType.EXACT }, // Before 6pt, After 6pt, Exactly 16pt
                children: paragraphChildren
            }));
        });
    }

    children.push(new Paragraph({ text: "" })); // Spacing before footer

    // Nơi nhận
    const noiNhanChildren = [];
    if (data.noi_nhan) {
        noiNhanChildren.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
                new TextRun({ text: "Nơi nhận:", font: "Times New Roman", size: 24, bold: true, italics: true }) // 12pt
            ]
        }));
        data.noi_nhan.forEach(item => {
            noiNhanChildren.push(new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({ text: "- " + item, font: "Times New Roman", size: 22 }) // 11pt
                ]
            }));
        });
    } else {
        noiNhanChildren.push(new Paragraph({ text: "" }));
    }

    // Chữ ký
    const chuKyChildren = [];
    if (data.chuc_danh_nguoi_ky) {
        chuKyChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: data.chuc_danh_nguoi_ky.toUpperCase(), font: "Times New Roman", size: 28, bold: true })
            ]
        }));
    }
    // Empty paragraphs for signature spacing
    chuKyChildren.push(new Paragraph({ text: "" }));
    chuKyChildren.push(new Paragraph({ text: "" }));
    chuKyChildren.push(new Paragraph({ text: "" }));
    chuKyChildren.push(new Paragraph({ text: "" }));

    if (data.ten_nguoi_ky) {
        chuKyChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: data.ten_nguoi_ky, font: "Times New Roman", size: 28, bold: true })
            ]
        }));
    }

    const footerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: noiNhanChildren.length > 0 ? noiNhanChildren : [new Paragraph({text: ""})]
                    }),
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: chuKyChildren.length > 0 ? chuKyChildren : [new Paragraph({text: ""})]
                    })
                ]
            })
        ]
    });

    children.push(footerTable);

    const doc = new Document({
        creator: "Tổ Chuyển đổi số - Trường Đại học Hùng Vương (Phú Thọ)",
        title: data.trich_yeu || data.ten_loai_van_ban || "Văn bản hành chính cấp Xã/Phường",
        description: "Hỗ trợ biên soạn văn bản hành chính theo Nghị định 30/2020/NĐ-CP - Trường Đại học Hùng Vương",
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1134,    // 20mm
                        bottom: 1134, // 20mm
                        left: 1701,   // 30mm
                        right: 1134   // 20mm
                    },
                    size: {
                        width: 11906,  // A4 size
                        height: 16838
                    }
                }
            },
            children: children
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Successfully generated ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node generate_nd30_docx.js <input_json> <output_docx>");
    process.exit(1);
}

createNd30Docx(args[0], args[1]).catch(err => {
    console.error("Error creating docx:", err);
    process.exit(1);
});
