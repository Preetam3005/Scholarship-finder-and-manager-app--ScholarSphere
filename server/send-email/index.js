const nodemailer = require('nodemailer');

// This is a simple serverless handler for Vercel / Netlify-style deployments.
// Configure SMTP credentials as environment variables in your deployment.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const { to, subject, text, html } = req.body || {};
    if (!to || !subject) {
      res.statusCode = 400;
      return res.end('Missing required fields');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
      secure: (process.env.EMAIL_SMTP_SECURE === 'true') || false,
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('send-email error', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
