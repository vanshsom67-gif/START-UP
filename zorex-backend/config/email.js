const nodemailer = require("nodemailer");

// Create transport configuration with environment variables
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    // Return null if credentials are not set (indicates mock mode)
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Generate visual HTML template for the order invoice receipt email.
 */
const generateInvoiceHTML = (order, customerName) => {
  const itemsListHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
        <strong>${item.name}</strong>
        ${item.selectedSize ? `<br/><span style="font-size: 11px; color: #64748b;">Size: ${item.selectedSize}</span>` : ""}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 600;">
        ₹${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  const originalTotal = order.subtotal || order.total;
  const discountHTML =
    order.discount > 0
      ? `
    <tr>
      <td colspan="2" style="padding: 6px 10px; font-size: 13px; color: #64748b; text-align: right;">Coupon Discount:</td>
      <td style="padding: 6px 10px; font-size: 13px; color: #16a34a; text-align: right; font-weight: 600;">-₹${order.discount.toLocaleString()}</td>
    </tr>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Zorexa Fashion Order Invoice</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
        .invoice-card { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
        .body-content { padding: 25px; }
        .details-grid { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px; }
        .details-col { flex: 1; font-size: 13px; color: #334155; }
        .table-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table-items th { background-color: #f8fafc; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; font-weight: 700; text-align: left; text-transform: uppercase; color: #64748b; }
        .summary-box { border-top: 2px solid #e2e8f0; padding-top: 15px; }
        .footer-note { text-align: center; padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <h1>Zorexa Fashion</h1>
          <p>Order Invoice Confirmation</p>
        </div>
        <div class="body-content">
          <div style="font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">
            Thank you for your order, ${customerName}!
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
            Your order has been received and is being processed. Below are the details of your invoice.
          </p>

          <div class="details-grid">
            <div class="details-col">
              <strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}<br/>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}<br/>
              <strong>Payment Status:</strong> <span style="color: ${order.isPaid ? "#16a34a" : "#d97706"}; font-weight: 700;">${order.isPaid ? "PAID" : "PENDING (COD)"}</span>
            </div>
            <div class="details-col">
              <strong>Shipping Address:</strong><br/>
              ${order.shippingAddress || "Via WhatsApp Contact"}
            </div>
          </div>

          <table class="table-items">
            <thead>
              <tr>
                <th style="width: 60%;">Item Description</th>
                <th style="text-align: center; width: 15%;">Qty</th>
                <th style="text-align: right; width: 25%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHTML}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse;" class="summary-box">
            <tr>
              <td colspan="2" style="padding: 6px 10px; font-size: 13px; color: #64748b; text-align: right;">Subtotal:</td>
              <td style="padding: 6px 10px; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600; width: 25%;">₹${originalTotal.toLocaleString()}</td>
            </tr>
            ${discountHTML}
            <tr>
              <td colspan="2" style="padding: 6px 10px; font-size: 13px; color: #64748b; text-align: right;">Delivery:</td>
              <td style="padding: 6px 10px; font-size: 13px; color: #16a34a; text-align: right; font-weight: 600;">FREE</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; font-size: 15px; font-weight: 700; color: #1e293b; text-align: right; border-top: 1px solid #e2e8f0;">Grand Total:</td>
              <td style="padding: 10px; font-size: 16px; font-weight: 700; color: #6366f1; text-align: right; border-top: 1px solid #e2e8f0;">₹${order.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div class="footer-note">
          © 2026 Zorexa Fashion. All rights reserved.<br/>
          If you have any questions, please contact us at support@zorexa.com or via WhatsApp at +91 8791910659.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send invoice confirmation email
 */
const sendOrderEmail = async (order, user) => {
  const transporter = getTransporter();
  const customerEmail = order.customerEmail || user?.email;
  const customerName = user?.name || "Zorexa Customer";

  if (!customerEmail) {
    console.warn("⚠️ Cannot send order confirmation email: No customer email address available.");
    return;
  }

  const htmlContent = generateInvoiceHTML(order, customerName);

  if (!transporter) {
    console.log(`\n📧 [MOCK EMAIL SENT] to ${customerEmail}`);
    console.log(`Subject: 🛍️ Zorexa Fashion - Order Invoice Confirmation #${order._id.toString().slice(-8).toUpperCase()}`);
    console.log(`Grand Total: ₹${order.total}`);
    console.log(`Payment Status: ${order.isPaid ? "PAID (Razorpay)" : "PENDING (COD)"}`);
    console.log(`(Configure SMTP_USER & SMTP_PASS in .env to send real emails via Nodemailer)\n`);
    return;
  }

  try {
    const mailOptions = {
      from: `"Zorexa Fashion" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `🛍️ Zorexa Fashion - Order Invoice Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Nodemailer Error: Could not send invoice email:", error.message);
  }
};

module.exports = { sendOrderEmail };
