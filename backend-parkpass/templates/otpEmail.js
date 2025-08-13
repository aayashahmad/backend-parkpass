// Beautiful OTP Email Template
const createOTPEmail = (otp, userName = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ParkPass - Password Reset OTP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .greeting {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .otp-label {
            color: white;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .expiry {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
            font-weight: 500;
        }
        
        .warning {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            color: #721c24;
            font-weight: 500;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 20px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .otp-code {
                font-size: 36px;
                letter-spacing: 4px;
            }
            
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏞️ ParkPass</div>
            <div class="header-subtitle">Beautiful Park Booking System</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${userName}! 👋</div>
            
            <div class="message">
                We received a request to reset your password. Use the OTP code below to proceed with your password reset.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">🔐 Your OTP Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry">
                ⏰ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>
            </div>
            
            <div class="warning">
                🛡️ <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and your account will remain secure.
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                Enter this OTP in the password reset form to continue. For your security, never share this code with anyone.
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                This email was sent by ParkPass - Beautiful Park Booking System
            </div>
            <div class="footer-text">
                📧 Need help? Contact us at support@parkpass.com
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">🌐 Website</a>
                <a href="#" class="social-link">📱 Mobile App</a>
                <a href="#" class="social-link">💬 Support</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer-text">
                © 2024 ParkPass. All rights reserved. ✨
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = { createOTPEmail };
