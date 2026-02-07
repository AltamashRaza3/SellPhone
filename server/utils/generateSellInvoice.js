import PDFDocument from "pdfkit";

/* ================= SELL INVOICE GENERATOR (STREAM) ================= */
export const generateInvoice = async (sellRequest) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  /* ================= HEADER ================= */
  doc.fontSize(20).text("SellPhone Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice ID: INV-${sellRequest._id.toString().slice(-6)}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  /* ================= CUSTOMER ================= */
  doc.text(`Customer Email: ${sellRequest.user.email}`);
  doc.moveDown();

  /* ================= PHONE DETAILS ================= */
  doc.text(`Phone: ${sellRequest.phone.brand} ${sellRequest.phone.model}`);
  doc.text(`Storage: ${sellRequest.phone.storage}`);
  doc.text(`Condition: ${sellRequest.phone.declaredCondition}`);
  doc.moveDown();

  /* ================= PRICE ================= */
  doc.fontSize(14).text(
    `Final Price: ₹${sellRequest.verification.finalPrice}`,
    { underline: true }
  );

  doc.moveDown(2);
  doc.fontSize(10).text(
    "This is a system generated invoice and does not require a signature.",
    { align: "center" }
  );

  return doc; 
};
