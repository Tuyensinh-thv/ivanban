import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  LineRuleType,
} from 'docx';
import { ND30Document } from '../types/nd30';

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
};

interface CreateDocxOptions {
  highlightEdits?: boolean;
}

export async function generateND30Blob(
  data: ND30Document,
  options: CreateDocxOptions = {}
): Promise<Blob> {
  const isCongVan = !data.ten_loai_van_ban;

  const createTextRun = (
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      italics?: boolean;
      is_edited?: boolean;
      color?: string;
    } = {}
  ) => {
    const isEdited = options.highlightEdits && opts.is_edited;
    return new TextRun({
      text: text,
      font: 'Times New Roman',
      size: opts.size || 28, // 14pt default in half-points
      bold: opts.bold || false,
      italics: opts.italics || false,
      color: isEdited ? 'FF0000' : opts.color || '000000',
    });
  };

  // Header Left Column (Cơ quan & Số hiệu)
  const leftColumnChildren: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        createTextRun((data.co_quan_chu_quan || '').toUpperCase(), { size: 24 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        createTextRun((data.co_quan_ban_hanh || '').toUpperCase(), {
          size: 26,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [createTextRun('-------', { size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [createTextRun(data.so_ky_hieu || 'Số:    /…', { size: 26 })],
    }),
  ];

  if (isCongVan && data.trich_yeu) {
    leftColumnChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60 },
        children: [
          createTextRun(
            'V/v ' + data.trich_yeu.replace(/^Về việc\s+/i, '').replace(/^V\/v\s+/i, ''),
            { size: 24, italics: true }
          ),
        ],
      })
    );
  }

  // Header Table (2 columns)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            children: leftColumnChildren,
          }),
          new TableCell({
            width: { size: 58, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createTextRun('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', {
                    size: 24,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createTextRun('Độc lập - Tự do - Hạnh phúc', {
                    size: 26,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createTextRun('---------------', { size: 24 })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  createTextRun(data.dia_danh_ngay_thang || '', {
                    size: 28,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const bodyChildren: (Paragraph | Table)[] = [headerTable];
  bodyChildren.push(new Paragraph({ text: '' }));

  // Document Type Name
  if (data.ten_loai_van_ban) {
    bodyChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [
          createTextRun(data.ten_loai_van_ban.toUpperCase(), {
            size: 28,
            bold: true,
          }),
        ],
      })
    );

    if (data.trich_yeu) {
      bodyChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 120 },
          children: [
            createTextRun(data.trich_yeu, { size: 28, bold: true }),
          ],
        })
      );
      bodyChildren.push(new Paragraph({ text: '' }));
    }
  }

  // Kính gửi (Công văn / Tờ trình)
  if (data.kinh_gui) {
    bodyChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        indent: { left: 1440 },
        spacing: { before: 180, after: 120 },
        children: [
          createTextRun('Kính gửi: ', { size: 28, bold: true }),
          createTextRun(data.kinh_gui, { size: 28 }),
        ],
      })
    );
  }

  // Căn cứ pháp lý
  if (data.can_cu && data.can_cu.length > 0) {
    data.can_cu.forEach((cc) => {
      bodyChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 }, // 1.27cm
          spacing: {
            before: 120,
            after: 120,
            line: 320,
            lineRule: LineRuleType.EXACT,
          }, // Exactly 16pt
          children: [createTextRun(cc, { size: 28, italics: true })],
        })
      );
    });
  }

  // Nội dung chính
  if (data.noi_dung && data.noi_dung.length > 0) {
    data.noi_dung.forEach((block) => {
      const pChildren: TextRun[] = [];
      if (block.loai === 'dieu' && block.tieu_de) {
        pChildren.push(
          createTextRun(block.tieu_de + ' ', { size: 28, bold: true })
        );
      } else if (block.tieu_de) {
        pChildren.push(
          createTextRun(block.tieu_de + ' ', { size: 28, bold: true })
        );
      }
      if (block.noi_dung) {
        pChildren.push(
          createTextRun(block.noi_dung, {
            size: 28,
            is_edited: block.is_edited,
          })
        );
      }

      bodyChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 },
          spacing: {
            before: 120,
            after: 120,
            line: 320,
            lineRule: LineRuleType.EXACT,
          },
          children: pChildren,
        })
      );
    });
  }

  bodyChildren.push(new Paragraph({ text: '' }));

  // Footer: Nơi nhận & Chữ ký
  let footerTable: Table;

  if (data.nguoi_ky && Array.isArray(data.nguoi_ky) && data.nguoi_ky.length > 0) {
    const cells = data.nguoi_ky.map((nk) => {
      const nkChildren: Paragraph[] = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            createTextRun(nk.chuc_danh.toUpperCase(), { size: 28, bold: true }),
          ],
        }),
      ];
      for (let i = 0; i < 4; i++) {
        nkChildren.push(new Paragraph({ text: '' }));
      }
      if (nk.ten) {
        nkChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun(nk.ten, { size: 28, bold: true })],
          })
        );
      }
      return new TableCell({
        width: {
          size: Math.floor(100 / data.nguoi_ky!.length),
          type: WidthType.PERCENTAGE,
        },
        children: nkChildren,
      });
    });

    footerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [new TableRow({ children: cells })],
    });
  } else {
    // Mặc định: Nơi nhận bên trái, Người ký bên phải
    const noiNhanChildren: Paragraph[] = [];
    if (data.noi_nhan && data.noi_nhan.length > 0) {
      noiNhanChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            createTextRun('Nơi nhận:', {
              size: 24, // 12pt
              bold: true,
              italics: true,
            }),
          ],
        })
      );
      data.noi_nhan.forEach((item) => {
        noiNhanChildren.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              createTextRun('- ' + item, { size: 22 }), // 11pt
            ],
          })
        );
      });
    } else {
      noiNhanChildren.push(new Paragraph({ text: '' }));
    }

    const chuKyChildren: Paragraph[] = [];
    if (data.chuc_danh_nguoi_ky) {
      chuKyChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            createTextRun(data.chuc_danh_nguoi_ky.toUpperCase(), {
              size: 28,
              bold: true,
            }),
          ],
        })
      );
    }
    for (let i = 0; i < 4; i++) {
      chuKyChildren.push(new Paragraph({ text: '' }));
    }
    if (data.ten_nguoi_ky) {
      chuKyChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun(data.ten_nguoi_ky, { size: 28, bold: true })],
        })
      );
    }

    footerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: noiNhanChildren,
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: chuKyChildren,
            }),
          ],
        }),
      ],
    });
  }

  bodyChildren.push(footerTable);

  const doc = new Document({
    creator: 'Hệ thống Quản lý & Soạn thảo Văn bản iVanban',
    title: data.trich_yeu || data.ten_loai_van_ban || 'Văn bản hành chính',
    description: 'Chuẩn thể thức Nghị định 30/2020/NĐ-CP',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1701, // 30mm
              right: 1134, // 20mm
            },
            size: {
              width: 11906, // A4
              height: 16838,
            },
          },
        },
        children: bodyChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocxBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function exportND30ToDocx(doc: ND30Document, customFilename?: string, highlightEdits?: boolean) {
  const blob = await generateND30Blob(doc, { highlightEdits });
  const name =
    customFilename ||
    `${doc.ten_loai_van_ban || 'Cong_van'}_${(doc.trich_yeu || 'Van_ban')
      .substring(0, 30)
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_À-ỹ]/g, '')}`;
  downloadDocxBlob(blob, name);
}
