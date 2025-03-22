import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD
  }
});


  
// for guide

const requestVerificationMail = async (email, fullname,tempPassword) => {
    const mailOptions = {
        from: `Guide Me Nepal <${process.env.NODE_MAILER_EMAIL}>`,
        to: email,
        subject: 'Your Account Has Been Verified - Guide Me Nepal',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Verified - Guide Me Nepal</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 20px 0;">
                  <table align="center" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden; margin: 0 auto;">
                    <!-- Header with logo -->
                    <tr>
                      <td style="background-color: #2b6cb0; padding: 20px 30px; text-align: center;">
                        <img src="${process.env.LOGO_URL}" alt="Guide Me Nepal" width="180" style="display: block; margin: 0 auto;">
                      </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="text-align: center; padding-bottom: 30px;">
                              <img src="https://static.vecteezy.com/system/resources/thumbnails/047/309/973/small/verified-badge-profile-icon-png.png" alt="Verified" width="80" style="display: inline-block;">
                              <h2 style="margin: 15px 0 0; color: #2b6cb0; font-size: 24px;">Account Verification Successful</h2>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 20px; font-size: 16px;">Congratulations ${fullname}! Your Guide Me Nepal account has been successfully verified.</p>
                        
                        <p style="margin: 0 0 10px; font-size: 16px;">You can now login to your account using the temporary password below:</p>
                        
                        <div style="background-color: #f0f7ff; border: 1px solid #ccdff5; border-left: 4px solid #2b6cb0; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center;">
                          <p style="margin: 0 0 5px; font-size: 14px; color: #666666;">Your Temporary Password</p>
                          <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #2b6cb0;">${tempPassword}</p>
                        </div>
                        
                        <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-left: 4px solid #dd6b20; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; font-size: 15px; color: #dd6b20; font-weight: bold;">Important Security Notice</p>
                          <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">For your security, please change this temporary password immediately after your first login.</p>
                        </div>
                        
                        <p style="margin: 25px 0 0; font-size: 16px;">If you have any questions or need assistance, please contact our support team at <a href="mailto:support@guidemenepal.com" style="color: #2b6cb0; text-decoration: none; font-weight: bold;">support@guidemenepal.com</a>.</p>
                      </td>
                    </tr>
                    
                    <!-- Call to action -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background-color: #2b6cb0; border-radius: 6px; text-align: center; padding: 15px;">
                              <a href="${process.env.CLIENT_URL}/login/guide" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; display: block;">Login Now</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f0f0f0; padding: 20px 30px; text-align: center; font-size: 14px; color: #666666;">
                        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Guide Me Nepal. All rights reserved.</p>
                        <p style="margin: 0 0 10px;">Thamel, Kathmandu, Nepal</p>
                        <p style="margin: 0; font-size: 12px; color: #999999;">This is an automated message. Please do not reply to this email.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };
    
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            reject(error);
        } else {
            resolve(info);
        }
        });
    });
    };

const requestRejectionMail = async (email, fullName) => {
      const mailOptions = {
          from: `Guide Me Nepal <${process.env.NODE_MAILER_EMAIL}>`,
          to: email,
          subject: 'Your Guide Application Has Been Rejected - Guide Me Nepal',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Application Rejected - Guide Me Nepal</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 20px 0;">
                    <table align="center" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden; margin: 0 auto;">
                      <!-- Header with logo -->
                      <tr>
                        <td style="background-color: #d32f2f; padding: 20px 30px; text-align: center;">
                          <img src="${process.env.LOGO_URL}" alt="Guide Me Nepal" width="180" style="display: block; margin: 0 auto;">
                        </td>
                      </tr>
                      
                      <!-- Main content -->
                      <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                          <img src="https://static.vecteezy.com/system/resources/thumbnails/004/813/161/small/rejected-stamp-rubber-grunge-texture-sign-free-vector.jpg" alt="Rejected" width="80" style="display: inline-block;">
                          <h2 style="margin: 20px 0 10px; color: #d32f2f; font-size: 24px;">Application Rejected</h2>
                          
                          <p style="margin: 0 0 20px; font-size: 16px;">Dear ${fullName},</p>
                          
                          <p style="margin: 0 0 20px; font-size: 16px;">Thank you for your interest in joining the Guide Me Nepal network. Unfortunately, after careful review, we regret to inform you that your application has not been approved at this time.</p>
                          
                          <p style="margin: 0 0 20px; font-size: 16px;">Our decision was based on our eligibility criteria and current requirements. You may consider reapplying in the future when your qualifications and experience align better with our platform's needs.</p>
                          
                          <p style="margin: 0 0 30px; font-size: 16px;">If you would like more details regarding the rejection or have any questions, feel free to contact our support team.</p>
                          
                          <p style="margin: 25px 0 0; font-size: 16px;">For inquiries, please reach out to <a href="mailto:support@guidemenepal.com" style="color: #d32f2f; text-decoration: none; font-weight: bold;">support@guidemenepal.com</a>.</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f0f0f0; padding: 20px 30px; text-align: center; font-size: 14px; color: #666666;">
                          <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Guide Me Nepal. All rights reserved.</p>
                          <p style="margin: 0 0 10px;">Thamel, Kathmandu, Nepal</p>
                          <p style="margin: 0; font-size: 12px; color: #999999;">This is an automated message. Please do not reply to this email.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        };
      
      return new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              reject(error);
          } else {
              resolve(info);
          }
          });
      });
  };
  
 

const registrationSubmittedMail = async (email, fullName) => {
    const mailOptions = {
        from: `Guide Me Nepal <${process.env.NODE_MAILER_EMAIL}>`,
        to: email,
        subject: 'Your Guide Application Has Been Received - Guide Me Nepal',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Received - Guide Me Nepal</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 20px 0;">
                  <table align="center" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden; margin: 0 auto;">
                    <!-- Header with logo -->
                    <tr>
                      <td style="background-color: #1E40AF; padding: 20px 30px; text-align: center;">
                        <img src="${process.env.LOGO_URL}" alt="Guide Me Nepal" width="180" style="display: block; margin: 0 auto;">
                      </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #1E40AF; font-size: 24px;">Application Received</h2>
                        
                        <p style="margin: 0 0 20px; font-size: 16px;">Dear ${fullName},</p>
                        
                        <p style="margin: 0 0 20px; font-size: 16px;">Thank you for applying to join the Guide Me Nepal network. We have successfully received your guide application and appreciate your interest in partnering with us.</p>
                        
                        <p style="margin: 0 0 20px; font-size: 16px;">Our team will now carefully review your qualifications, experience, and documentation. You can expect to hear back from us within <strong>3-5 business days</strong>.</p>
                        
                        <p style="margin: 0 0 30px; font-size: 16px;">If we need any additional information to complete your application, we will contact you directly via email.</p>
                        
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background-color: #f5f5f5; padding: 20px; border-radius: 6px;">
                              <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">What's Next?</h3>
                              <ul style="margin: 0 0 0 20px; padding: 0; font-size: 15px; color: #555555;">
                                <li style="margin-bottom: 10px;">Our team reviews your application (3-5 business days)</li>
                                <li style="margin-bottom: 10px;">You'll receive an email with our decision</li>
                                <li style="margin-bottom: 10px;">If approved, you'll gain access to your guide dashboard</li>
                                <li style="margin-bottom: 0;">Set up your availability and start receiving booking requests</li>
                              </ul>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 0; font-size: 16px;">If you have any questions in the meantime, please don't hesitate to contact our support team at <a href="mailto:support@guidemenepal.com" style="color: #1E40AF; text-decoration: none; font-weight: bold;">support@guidemenepal.com</a>.</p>
                      </td>
                    </tr>
                    
                    <!-- Call to action -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background-color: #1E40AF; border-radius: 6px; text-align: center; padding: 15px;">
                              <a href="https://guidemenepal.com/guide/status" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; display: block;">Check Application Status</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f0f0f0; padding: 20px 30px; text-align: center; font-size: 14px; color: #666666;">
                        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Guide Me Nepal. All rights reserved.</p>
                        <p style="margin: 0;">Place, City, Country</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            reject(error);
        } else {
            resolve(info);
        }
        });
    }
    );
}
const requestViewedMail = async (email, fullName) => {
  const mailOptions = {
    from: `Guide Me Nepal <${process.env.NODE_MAILER_EMAIL}>`,
    to: email,
    subject: 'Your Profile is Under Review - Guide Me Nepal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile Under Review - Guide Me Nepal</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9f9f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 20px 0;">
              <table align="center" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden; margin: 0 auto;">
                <!-- Header with logo -->
                <tr>
                  <td style="background-color: #1E40AF; padding: 20px 30px; text-align: center;">
                    <img src="${process.env.LOGO_URL}" alt="Guide Me Nepal" width="180" style="display: block; margin: 0 auto;">
                  </td>
                </tr>
                
                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #1E40AF; font-size: 24px;">Profile Under Review</h2>
                    
                    <p style="margin: 0 0 20px; font-size: 16px;">Dear ${fullName},</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px;">Thank you for completing your profile on Guide Me Nepal. Our team is currently reviewing your information to ensure everything meets our requirements.</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px;">This process typically takes <strong>3-5 business days</strong>. We will notify you once the review is complete.</p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px;">If we require any additional details, we will contact you via email.</p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 20px; border-radius: 6px;">
                          <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Next Steps</h3>
                          <ul style="margin: 0 0 0 20px; padding: 0; font-size: 15px; color: #555555;">
                            <li style="margin-bottom: 10px;">Our team is verifying your profile details.</li>
                            <li style="margin-bottom: 10px;">You will receive an update within 3-5 business days.</li>
                            <li style="margin-bottom: 10px;">If approved, you will gain full access to the platform.</li>
                            <li style="margin-bottom: 0;">If updates are needed, we will contact you for revisions.</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 16px;">If you have any questions, feel free to contact our support team at <a href="mailto:support@guidemenepal.com" style="color: #1E40AF; text-decoration: none; font-weight: bold;">support@guidemenepal.com</a>.</p>
                  </td>
                </tr>
                
                <!-- Call to action -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #1E40AF; border-radius: 6px; text-align: center; padding: 15px;">
                          <a href="https://guidemenepal.com/profile/status" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; display: block;">Check Profile Status</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f0f0f0; padding: 20px 30px; text-align: center; font-size: 14px; color: #666666;">
                    <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Guide Me Nepal. All rights reserved.</p>
                    <p style="margin: 0;">Place, City, Country</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };
  

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            reject(error);
        } else {
            resolve(info);
        }
        });
    }
    );
}




export { requestVerificationMail, registrationSubmittedMail, requestViewedMail, requestRejectionMail };