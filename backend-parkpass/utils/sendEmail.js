const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const to = options.to || options.email;
  const { NODE_ENV, GMAIL_USER, GMAIL_PASS } = process.env;
  const isDev = NODE_ENV !== 'production';
  const hasGmail = !!(GMAIL_USER && GMAIL_PASS);

  let transporter;

  if (isDev && !hasGmail) {
    // Dev fallback: Ethereal preview (no real delivery)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  } else {
    if (!hasGmail) throw new Error('Gmail not configured (GMAIL_USER/GMAIL_PASS).');
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS } // use an App Password here
    });
  }

  const message = {
    from: `ParkPass <${process.env.GMAIL_USER || 'no-reply@parkpass.local'}>`,
    to,
    subject: options.subject,
    text: options.message || (options.html ? options.html.replace(/<[^>]+>/g, '') : ''),
    html: options.html || `<p>${options.message || ''}</p>`
  };

  const result = await transporter.sendMail(message);

  // Show Ethereal preview link in dev
  const preview = nodemailer.getTestMessageUrl?.(result);
  if (preview) console.log('Preview URL:', preview);

  return result;
};

module.exports = sendEmail;
