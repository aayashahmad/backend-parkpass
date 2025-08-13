# 📧 Gmail Setup Guide for ParkPass

This guide will help you configure Gmail to send beautiful OTP emails from your ParkPass application.

## 🚀 Quick Setup Steps

### 1. **Enable 2-Factor Authentication**
- Go to your [Google Account settings](https://myaccount.google.com/)
- Navigate to **Security** → **2-Step Verification**
- Follow the steps to enable 2FA (required for app passwords)

### 2. **Generate App Password**
- In Google Account settings, go to **Security**
- Under **2-Step Verification**, click **App passwords**
- Select **Mail** as the app and **Other** as the device
- Enter "ParkPass" as the device name
- Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 3. **Update Environment Variables**
Edit your `backend/.env` file:

```env
# Gmail Configuration (for sending emails)
GMAIL_USER=your.email@gmail.com
GMAIL_PASS=your_16_character_app_password
```

**Example:**
```env
GMAIL_USER=parkpass.system@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
```

### 4. **Restart the Server**
```bash
cd backend
npm run dev
```

## 🎨 Email Features

Once configured, your ParkPass system will send beautiful emails with:

- ✨ **Modern Design** - Glass morphism and gradients
- 🎨 **Responsive Layout** - Works on all devices
- 🔐 **Security Features** - Clear OTP display and warnings
- 📱 **Mobile Friendly** - Optimized for mobile viewing
- 🌟 **Professional Branding** - ParkPass branded templates

## 🔧 Troubleshooting

### **"Gmail credentials not configured" Error**
- Make sure you've updated the `.env` file with real credentials
- Restart the server after updating environment variables
- Check that 2FA is enabled on your Google account

### **"Authentication failed" Error**
- Verify the app password is correct (16 characters, no spaces)
- Make sure you're using an app password, not your regular Gmail password
- Try generating a new app password

### **"Connection timeout" Error**
- Check your internet connection
- Verify Gmail service is not blocked by firewall
- Try using a different network

## 🧪 Testing Email

### **Development Mode**
When Gmail is not configured, emails are displayed in the console:
```
📧 EMAIL SIMULATION
📬 To: user@example.com
📋 Subject: Password Reset OTP
📄 Content: [Beautiful HTML email]
```

### **Production Mode**
With proper Gmail configuration, real emails are sent:
```
✅ Gmail transporter verified successfully!
📧 Sending email...
✅ Email sent successfully! Message ID: <message-id>
```

## 🔒 Security Best Practices

1. **Use App Passwords** - Never use your main Gmail password
2. **Limit Access** - Only use the app password for ParkPass
3. **Monitor Usage** - Check Gmail sent folder for email activity
4. **Rotate Passwords** - Generate new app passwords periodically
5. **Environment Security** - Keep `.env` file secure and never commit it

## 📊 Email Analytics

Monitor your email sending:
- Check Gmail **Sent** folder for delivered emails
- Monitor server logs for sending status
- Track OTP usage in your application

## 🎯 Alternative Email Services

If you prefer not to use Gmail, you can configure other services:

### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your.email@outlook.com
SMTP_PASS=your_password
```

### **SendGrid**
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### **Mailgun**
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain
```

## 📞 Support

If you need help with email configuration:
- Check the server console for detailed error messages
- Verify all environment variables are set correctly
- Test with a simple email first
- Contact support if issues persist

## ✨ Features After Setup

Once Gmail is configured, users will receive:
- 🎨 Beautiful OTP emails with modern design
- 📱 Mobile-responsive email templates
- 🔐 Secure 6-digit OTP codes
- ⏰ Clear expiration warnings
- 🛡️ Security notices and tips

Your ParkPass system will be ready to send professional, beautiful emails! 🌟
