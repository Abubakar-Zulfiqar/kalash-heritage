import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

interface InquiryItem {
  productId: string;
  name: string;
  quantity: number;
  sku?: string;
}

interface InquiryData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  message?: string;
  items: InquiryItem[];
}

export async function POST(request: NextRequest) {
  try {
    const data: InquiryData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Name, email, and at least one product are required" },
        { status: 400 }
      );
    }

    // Format product list for email
    const productList = data.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}${item.sku ? ` (SKU: ${item.sku})` : ""} - Qty: ${item.quantity}`
      )
      .join("\n");

    const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);

    // Email content
    const emailSubject = `New Wholesale Inquiry from ${data.name}`;
    const emailBody = `
New Wholesale Inquiry

Customer Information:
---------------------
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Company: ${data.company || "Not provided"}
Country: ${data.country || "Not provided"}

Products Inquired (${data.items.length} products, ${totalItems} pieces total):
---------------------
${productList}

Additional Message:
---------------------
${data.message || "No additional message"}

---
This inquiry was submitted via the Kalash Heritage website.
    `.trim();

    // HTML email version
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .section h3 { margin-top: 0; color: #8B4513; }
    .product-item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .product-item:last-child { border-bottom: none; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Wholesale Inquiry</h1>
    </div>

    <div class="section">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Company:</strong> ${data.company || "Not provided"}</p>
      <p><strong>Country:</strong> ${data.country || "Not provided"}</p>
    </div>

    <div class="section">
      <h3>Products Inquired (${data.items.length} products, ${totalItems} pieces)</h3>
      ${data.items
        .map(
          (item) => `
        <div class="product-item">
          <strong>${item.name}</strong>
          ${item.sku ? `<br><small>SKU: ${item.sku}</small>` : ""}
          <br>Quantity: ${item.quantity}
        </div>
      `
        )
        .join("")}
    </div>

    ${
      data.message
        ? `
    <div class="section">
      <h3>Additional Message</h3>
      <p>${data.message.replace(/\n/g, "<br>")}</p>
    </div>
    `
        : ""
    }

    <div class="footer">
      <p>This inquiry was submitted via the Kalash Heritage website.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email if SMTP is configured
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && adminEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send to admin
      await transporter.sendMail({
        from: `"Kalash Heritage Website" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: emailSubject,
        text: emailBody,
        html: emailHtml,
      });

      // Send confirmation to customer
      await transporter.sendMail({
        from: `"Kalash Heritage" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: "Thank you for your inquiry - Kalash Heritage",
        text: `
Dear ${data.name},

Thank you for your inquiry! We have received your request for the following products:

${productList}

Our team will review your inquiry and get back to you within 24-48 business hours with pricing and availability information.

If you have any urgent questions, please don't hesitate to contact us directly.

Best regards,
Kalash Heritage Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Inquiry</h1>
    </div>
    <div class="content">
      <p>Dear ${data.name},</p>
      <p>Thank you for your inquiry! We have received your request for <strong>${data.items.length} products (${totalItems} pieces)</strong>.</p>
      <p>Our team will review your inquiry and get back to you within 24-48 business hours with pricing and availability information.</p>
      <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
      <p>Best regards,<br>Kalash Heritage Team</p>
    </div>
    <div class="footer">
      <p>Kalash Heritage - Handmade Oriental Rugs from Pakistan</p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      });
    }

    // Generate WhatsApp link for the response
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
    let whatsappLink = null;

    if (whatsappNumber) {
      const whatsappMessage = encodeURIComponent(
        `Hi, I'm ${data.name}${data.company ? ` from ${data.company}` : ""}. I'm interested in the following products:\n\n${data.items.map((item) => `• ${item.name} (Qty: ${item.quantity})`).join("\n")}\n\nPlease provide pricing and availability.`
      );
      whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      whatsappLink,
    });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
