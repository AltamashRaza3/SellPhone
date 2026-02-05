import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/* ================= RENDER-SAFE TEMP DIR ================= */
const INVOICE_DIR = "/tmp/invoices";

if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

/* ================= ORDER INVOICE GENERATOR ================= */
export const generateOrderInvoice = async (order) => {
  const invoiceNumber = `ORD-INV-${order._id.toString().slice(-6)}`;
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(INVOICE_DIR, fileName);

  // Reuse if generated during same runtime
  if (fs.existsSync(filePath)) {
    return {
      number: invoiceNumber,
      absolutePath: filePath,
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
      `${index + 1}. ${phone.brand} ${phone.model} × ${item.quantity}  ₹${phone.price}`
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
    absolutePath: filePath,
  };
};
