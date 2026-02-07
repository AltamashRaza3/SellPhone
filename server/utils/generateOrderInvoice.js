import PDFDocument from "pdfkit";

export const generateOrderInvoice = async (order) => {
  const invoiceNumber = `ORD-INV-${order._id.toString().slice(-6)}`;
  const doc = new PDFDocument({ size: "A4", margin: 50 });

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
  const addr = order.shippingAddress;
  doc.text(`Customer Email: ${order.user.email}`);
  doc.text(
    `Address: ${addr.name}, ${addr.line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`
  );
  doc.moveDown();

  /* ================= ITEMS ================= */
  doc.fontSize(14).text("Items:");
  doc.moveDown(0.5);

  order.items.forEach((item, index) => {
    const phone = item.productId; 

    doc.fontSize(11).text(
      `${index + 1}. ${phone?.brand || "Phone"} ${
        phone?.model || ""
      } × ${item.quantity}  ₹${item.price * item.quantity}`
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

  return doc;
};
