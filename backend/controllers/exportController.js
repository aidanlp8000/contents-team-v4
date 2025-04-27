// backend/controllers/exportController.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../config/db');

// Export to Excel
exports.exportExcel = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    // Fetch project and items
    const [[project]] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const [items] = await db.query('SELECT * FROM items WHERE project_id = ?', [projectId]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Contents');

    // Header
    sheet.addRow(['Project Title', project.title]);
    sheet.addRow(['Description', project.description]);
    sheet.addRow(['Insured Name', project.insured_name]);
    sheet.addRow(['Address', project.insured_address]);
    sheet.addRow(['Claim #', project.claim_number]);
    sheet.addRow(['Date of Loss', project.date_of_loss]);
    sheet.addRow(['Type of Loss', project.type_of_loss]);
    sheet.addRow([]); // empty row

    // Column titles
    sheet.addRow(['Item Name', 'Model', 'Quantity', 'Price', 'Total Price', 'Source', 'Photo URL']);

    // Data rows
    items.forEach(item => {
      sheet.addRow([
        item.name,
        item.model,
        item.quantity,
        item.price,
        item.total_price,
        item.source,
        item.photo_url
      ]);
    });

    // Set response headers
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="project_${projectId}_contents.xlsx"`
    );

    // Send workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Export to Excel failed' });
  }
};

// Export to PDF
exports.exportPdf = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    // Fetch project and items
    const [[project]] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const [items] = await db.query('SELECT * FROM items WHERE project_id = ?', [projectId]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream to response
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="project_${projectId}_contents.pdf"`
    );
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Cover page
    doc.fontSize(20).text(`Project: ${project.title}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Description: ${project.description}`)
      .text(`Insured Name: ${project.insured_name}`)
      .text(`Address: ${project.insured_address}`)
      .text(`Claim #: ${project.claim_number}`)
      .text(`Date of Loss: ${project.date_of_loss}`)
      .text(`Type of Loss: ${project.type_of_loss}`);
    doc.addPage();

    // Table header
    doc.fontSize(12).text('Contents List', { underline: true });
    doc.moveDown();

    // Table columns
    const tableTop = doc.y;
    const itemNameX = 50, modelX = 200, qtyX = 300, priceX = 350, totalX = 420;

    doc.text('Item Name', itemNameX, tableTop);
    doc.text('Model', modelX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    let y = tableTop + 20;

    for (const item of items) {
      // Draw row text
      doc.text(item.name, itemNameX, y, { width: 140 });
      doc.text(item.model, modelX, y);
      doc.text(item.quantity.toString(), qtyX, y);
      doc.text(item.price.toFixed(2), priceX, y);
      doc.text(item.total_price.toFixed(2), totalX, y);

      // Add photo thumbnail
      try {
        const imageUrl = item.photo_url;
        const imgY = y - 5;
        doc.image(imageUrl, totalX + 80, imgY, { width: 50, height: 50 });
      } catch (e) {
        console.warn('Could not load image', e);
      }

      y += 60;
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    }

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Export to PDF failed' });
  }
};
