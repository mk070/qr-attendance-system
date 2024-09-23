const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// Email configuration (replace with your actual credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // your Gmail account
    pass: 'your-email-password',  // your Gmail app-specific password (not your regular Gmail password)
  },
});

// Excel file containing student data
const excelFilePath = path.join(__dirname, 'students.xlsx');

// Folder containing the generated QR codes
const qrCodesFolder = path.join(__dirname, 'qrcodes');

// Function to send emails to students
const sendEmailsWithQRCodes = () => {
  // Step 1: Read the Excel file
  const workbook = xlsx.readFile(excelFilePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const students = xlsx.utils.sheet_to_json(worksheet);

  students.forEach((student, index) => {
    // Find the corresponding QR code file
    const qrCodePath = path.join(qrCodesFolder, `student_${index + 1}_${student.Name}.png`);

    // Ensure the QR code file exists
    if (!fs.existsSync(qrCodePath)) {
      console.error(`QR code not found for ${student.Name}`);
      return;
    }

    // Step 2: Send an email with the QR code
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: student["Domain Email ID (College ID)"],  // Send to student's email
      subject: `Your Unique QR Code for Attendance`,
      text: `Hello ${student.Name},\n\nPlease find attached your unique QR code for attendance.`,
      attachments: [
        {
          filename: `QR_Code_${student.Name}.png`,
          path: qrCodePath,  // Attach the QR code file
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Failed to send QR code to ${student.Name}:`, error);
      } else {
        console.log(`QR code sent to ${student.Name}:`, info.response);
      }
    });
  });
};

module.exports = { sendEmailsWithQRCodes };
