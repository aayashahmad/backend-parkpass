const nodemailer = require('nodemailer');

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject, and message'
      });
    }

    // Create email transporter (using Gmail for demo)
    // In production, you would use proper SMTP credentials
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'demo@example.com',
        pass: process.env.EMAIL_PASS || 'demo_password'
      }
    });

    // Email content
    const emailContent = `
      New Contact Form Submission - ParkPass
      
      Contact Details:
      ================
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Subject: ${subject}
      
      Message:
      ========
      ${message}
      
      ---
      This email was sent from the ParkPass contact form.
      Please respond to: ${email}
    `;

    // Email options
    const mailOptions = {
      from: email,
      to: 'bhatashu954@gmail.com',
      subject: `ParkPass Contact: ${subject}`,
      text: emailContent,
      replyTo: email
    };

    // For demo purposes, we'll just log the email content
    // In production, uncomment the line below to send actual emails
    // await transporter.sendMail(mailOptions);
    
    console.log('Contact form submission received:');
    console.log('================================');
    console.log(`From: ${name} (${email})`);
    console.log(`Phone: ${phone || 'Not provided'}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('================================');
    console.log('Email would be sent to: bhatashu954@gmail.com');

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! Aayash Ahmad Bhat will get back to you soon.',
      data: {
        name,
        email,
        subject,
        sentTo: 'bhatashu954@gmail.com'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// @desc    Get contact information
// @route   GET /api/contact/info
// @access  Public
exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = {
      contactPerson: {
        name: 'Aayash Ahmad Bhat',
        title: 'ParkPass Administrator'
      },
      phone: '+91 7006052604',
      email: 'bhatashu954@gmail.com',
      whatsapp: '+91 7006052604',
      address: {
        street: 'Near Main Market',
        city: 'Pulwama',
        state: 'Jammu & Kashmir',
        pincode: '192301',
        country: 'India'
      },
      businessHours: 'Mon-Fri 9AM-6PM IST',
      socialMedia: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        youtube: '#'
      }
    };

    res.status(200).json({
      success: true,
      data: contactInfo
    });

  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact information'
    });
  }
};
