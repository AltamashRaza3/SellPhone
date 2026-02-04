import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root → sellphone/
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// uploads/invoices/order
const INVOICE_DIR = path.join(
  PROJECT_ROOT,
  "uploads",
  "invoices",
  "order"
);

/* ================= ENSURE FOLDER ================= */
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

/* ================= ORDER INVOICE GENERATOR ================= */
export const generateOrderInvoice = async (order) => {
  const invoiceNumber = `ORD-INV-${order._id.toString().slice(-6)}`;
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(INVOICE_DIR, fileName);

  // 🔒 Prevent duplicate generation
  if (fs.existsSync(filePath)) {
    return {
      number: invoiceNumber,
      url: `/uploads/invoices/order/${fileName}`,
    };
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ================= HEADER ================= */
  doc.fontSize(20).text("SellPhone Order Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(
    `Date: ${new Date(order.deliveredAt || Date.now()).toLocaleDateString()}`
  );
  doc.moveDown();

  /* ================= CUSTOMER ================= */
  doc.text(`Customer Email: ${order.user.email}`);
  doc.text(`Shipping Address: ${order.shippingAddress}`);
  doc.moveDown();

  /* ================= ITEMS ================= */
  doc.fontSize(14).text("Items:");
  doc.moveDown(0.5);

  order.items.forEach((item, index) => {
    const phone = item.phone;
    doc.fontSize(11).text(
      `${index + 1}. ${phone.brand} ${phone.model} ${phone.storage || ""} × ${item.quantity}`
    );
  });

  doc.moveDown();

  /* ================= TOTAL ================= */
  doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
    underline: true,
  });

  doc.moveDown(2);
  doc.fontSize(10).text(
    "This is a system generated invoice and is valid without signature.",
    { align: "center" }
  );

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));

  return {
    number: invoiceNumber,
    url: `/uploads/invoices/order/${fileName}`,
  };
};
