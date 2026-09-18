const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, Footer, LineRuleType } = require('docx');

const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
};

async function createNd30EditorDocx(jsonPath, outputPath) {
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

    const isCongVan = !data.ten_loai_van_ban;

    const createTextRun = (text, options = {}) => {
        return new TextRun({
            text: text,
            font: "Times New Roman",
            size: options.size || 28,
            bold: options.bold || false,
            italics: options.italics || false,
            color: options.is_edited ? "FF0000" : (options.color || "000000")
        });
    };

    const leftColumnChildren = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun((data.co_quan_chu_quan || '').toUpperCase(), { size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun((data.co_quan_ban_hanh || '').toUpperCase(), { size: 26, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun("-------", { size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun(data.so_ky_hieu || '', { size: 26 })] })
    ];

    if (isCongVan && data.trich_yeu) {
        leftColumnChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun("V/v " + data.trich_yeu.replace(/^Về việc\s+/i, ''), { size: 24 })]
        }));
    }

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
            new TableRow({
                children: [
                    new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: leftColumnChildren }),
                    new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { size: 24, bold: true })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun("Độc lập - Tự do - Hạnh phúc", { size: 26, bold: true })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun("---------------", { size: 24 })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [createTextRun(data.dia_danh_ngay_thang || '', { size: 28, italics: true })] })
                        ]
                    })
                ]
            })
        ]
    });

    const children = [headerTable, new Paragraph({ text: "" })];

    if (data.ten_loai_van_ban) {
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun(data.ten_loai_van_ban.toUpperCase(), { size: 28, bold: true })]
        }));
        if (data.trich_yeu) {
            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createTextRun(data.trich_yeu, { size: 28, bold: true })]
            }));
            children.push(new Paragraph({ text: "" }));
        }
    }

    if (data.kinh_gui) {
        children.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 1440 },
            spacing: { before: 240, after: 120 },
            children: [createTextRun("Kính gửi: ", { size: 28 }), createTextRun(data.kinh_gui, { size: 28 })]
        }));
    }

    children.push(new Paragraph({ text: "" }));

    if (data.can_cu && data.can_cu.length > 0) {
        data.can_cu.forEach(cc => {
            const text = typeof cc === 'string' ? cc : cc.text;
            const isEdited = typeof cc === 'object' ? cc.is_edited : false;
            children.push(new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 },
                spacing: { before: 120, after: 120, line: 320, lineRule: LineRuleType.EXACT }, // Before 6pt, After 6pt, Exactly 16pt
                children: [createTextRun(text, { size: 28, italics: true, is_edited: isEdited })]
            }));
        });
    }

    if (data.noi_dung && data.noi_dung.length > 0) {
        data.noi_dung.forEach(block => {
            const paragraphChildren = [];
            if (block.loai === 'dieu' && block.tieu_de) {
                paragraphChildren.push(createTextRun(block.tieu_de + ' ', { size: 28, bold: true }));
            }
            if (block.noi_dung) {
                paragraphChildren.push(createTextRun(block.noi_dung, { size: 28, is_edited: block.is_edited }));
            }
            children.push(new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 },
                spacing: { before: 120, after: 120, line: 320, lineRule: LineRuleType.EXACT }, // Before 6pt, After 6pt, Exactly 16pt
                children: paragraphChildren
            }));
        });
    }

    children.push(new Paragraph({ text: "" }));

    // Xử lý Footer (Chữ ký)
    let footerTable;
    if (data.nguoi_ky && Array.isArray(data.nguoi_ky) && data.nguoi_ky.length > 0) {
        // Trường hợp nhiều người ký (Hợp đồng, Biên bản...)
        const cells = data.nguoi_ky.map(nk => {
            const nkChildren = [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [createTextRun(nk.chuc_danh.toUpperCase(), { size: 28, bold: true })]
                })
            ];
            for(let i=0; i<4; i++) nkChildren.push(new Paragraph({ text: "" }));
            if (nk.ten) {
                nkChildren.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [createTextRun(nk.ten, { size: 28, bold: true })]
                }));
            }
            return new TableCell({
                width: { size: 100 / data.nguoi_ky.length, type: WidthType.PERCENTAGE },
                children: nkChildren
            });
        });

        footerTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [new TableRow({ children: cells })]
        });
    } else {
        // Trường hợp mặc định (Nơi nhận bên trái, 1 người ký bên phải)
        const noiNhanChildren = [];
        if (data.noi_nhan) {
            noiNhanChildren.push(new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [createTextRun("Nơi nhận:", { size: 24, bold: true, italics: true })]
            }));
            data.noi_nhan.forEach(item => {
                noiNhanChildren.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [createTextRun("- " + item, { size: 22 })] }));
            });
        } else {
            noiNhanChildren.push(new Paragraph({ text: "" }));
        }

        const chuKyChildren = [];
        if (data.chuc_danh_nguoi_ky) {
            chuKyChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun(data.chuc_danh_nguoi_ky.toUpperCase(), { size: 28, bold: true })] }));
        }
        for(let i=0; i<4; i++) chuKyChildren.push(new Paragraph({ text: "" }));
        if (data.ten_nguoi_ky) {
            chuKyChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [createTextRun(data.ten_nguoi_ky, { size: 28, bold: true })] }));
        }

        footerTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: noiNhanChildren }),
                        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: chuKyChildren })
                    ]
                })
            ]
        });
    }

    children.push(footerTable);

    const doc = new Document({
        creator: "Tổ Chuyển đổi số - Trường Đại học Hùng Vương (Phú Thọ)",
        title: data.trich_yeu || data.ten_loai_van_ban || "Văn bản hiệu đính cấp Xã/Phường",
        description: "Hỗ trợ soát lỗi và hiệu đính văn bản hành chính theo Nghị định 30/2020/NĐ-CP - Trường Đại học Hùng Vương",
        sections: [{
            properties: {
                page: {
                    margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 },
                    size: { width: 11906, height: 16838 }
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
    console.error("Usage: node generate_nd30_editor.js <input_json> <output_docx>");
    process.exit(1);
}

createNd30EditorDocx(args[0], args[1]).catch(err => {
    console.error("Error creating docx:", err);
    process.exit(1);
});
