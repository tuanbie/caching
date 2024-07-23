import * as ExcelJS from 'exceljs';
import { Response } from 'express';

interface PlainExcelProps {
  res: Response;
  fileName: string;
  colTitle: any[];
  data: object[];
}

export const toPlainExcel = async (props: PlainExcelProps) => {
  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  worksheet.columns = props.colTitle.map((title) => ({
    header: title[0],
    key: title[1],
    width: title[2],
    style: { alignment: { horizontal: 'left' } },
  }));
  worksheet.addRows(props.data);

  // In đậm chữ ở hàng đầu tiên
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2ed573' }, // Màu nền xanh lá cây
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Thiết lập header để trình duyệt hiểu rằng đây là file đính kèm và kiểu file là Excel
  props.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  props.res.setHeader(
    'Content-Disposition',
    `attachment; filename=${props.fileName}`,
  );

  // Ghi dữ liệu ra response mà không lưu ra file
  await workbook.xlsx.write(props.res);

  // Kết thúc response
  props.res.end();
};
