import nodemailer from "nodemailer";

export const sendPayoutEmail = async ({
  to,
  sellerName,
  phoneModel,
  amount,
  transactionReference,
  paidAt,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Transferred Successfully</h2>
        <p>Hello ${sellerName || "Seller"},</p>
        <p>Your payment for <strong>${phoneModel}</strong> has been successfully transferred.</p>
        
        <div style="margin-top: 15px;">
          <p><strong>Amount:</strong> ₹${amount.toLocaleString("en-IN")}</p>
          <p><strong>Transaction ID:</strong> ${transactionReference}</p>
          <p><strong>Paid At:</strong> ${new Date(paidAt).toLocaleString()}</p>
        </div>

        <p style="margin-top: 20px;">
          The amount may take up to 24 hours to reflect in your bank account.
        </p>

        <p>Thank you for using our service.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"SellPhone Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Payment Has Been Transferred",
      html,
    });

  } catch (err) {
    console.error("EMAIL SEND ERROR:", err.message);
  }
};
