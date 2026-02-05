import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root → sellphone/
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// uploads/invoices
const INVOICE_DIR = path.join(PROJECT_ROOT, "uploads", "invoices");

/* ================= ENSURE FOLDER ================= */
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

/* ================= GENERATOR ================= */
export const generateInvoice = async (sellRequest) => {
  const invoiceNumber = `INV-${sellRequest._id.toString()}`;
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(INVOICE_DIR, fileName);

  // 🔒 Prevent duplicate generation
  if (fs.existsSync(filePath)) {
    return {
      number: invoiceNumber,
      url: `/uploads/invoices/${fileName}`,
    };
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ================= CONTENT ================= */
  doc.fontSize(20).text("SellPhone Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Customer: ${sellRequest.user.email}`);
  doc.text(`Phone: ${sellRequest.phone.brand} ${sellRequest.phone.model}`);
  doc.text(`Storage: ${sellRequest.phone.storage}`);
  doc.moveDown();

  doc.fontSize(14).text(
    `Final Price: ₹${sellRequest.verification.finalPrice}`,
    { underline: true }
  );

  doc.moveDown(2);
  doc.fontSize(10).text(
    "This is a system generated invoice.",
    { align: "center" }
  );

  doc.end();

  // wait until file is fully written
  await new Promise((resolve) => stream.on("finish", resolve));

  return {
    number: invoiceNumber,
    url: `uploads/invoices/${fileName}`,
  };
};
