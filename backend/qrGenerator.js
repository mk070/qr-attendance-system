const xlsx = require('xlsx');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// File path for the Excel sheet containing student data
const excelFilePath = path.join(__dirname, 'students.xlsx');

// Folder to store generated QR codes
const qrCodesFolder = path.join(__dirname, 'qrcodes');

// Ensure the QR codes folder exists
if (!fs.existsSync(qrCodesFolder)) {
  fs.mkdirSync(qrCodesFolder);
}

// Read Excel and generate QR codes for all students
const generateQRCodes = () => {
  const workbook = xlsx.readFile(excelFilePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const students = xlsx.utils.sheet_to_json(worksheet);

  students.forEach((student, index) => {
    const studentData = {
      name: student.Name,
      regNo: student["Reg No"],
      college: student.College,
      department: student.Department,
      email: student["Domain Email ID (College ID)"],
      whatsapp: student["Whatsapp Number"]
    };

    const qrCodeData = JSON.stringify(studentData);

    // Generate QR code and save it as a PNG file
    QRCode.toFile(
      path.join(qrCodesFolder, `student_${index + 1}_${student.Name}.png`),
      qrCodeData,
      (err) => {
        if (err) {
          console.error(`Error generating QR code for ${studentData.name}:`, err);
        } else {
          console.log(`QR code generated for ${studentData.name}`);
        }
      }
    );
  });
};

// Function to zip the QR codes folder
const zipQRCodes = (res) => {
  const zipFilePath = path.join(__dirname, 'qrcodes.zip');
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Archive created and size is ${archive.pointer()} total bytes`);
    res.download(zipFilePath);
  });

  archive.on('error', (err) => {
    console.error('Error while zipping QR codes:', err);
    res.status(500).json({ error: 'Failed to zip QR codes.' });
  });

  archive.pipe(output);
  archive.directory(qrCodesFolder, false);
  archive.finalize();
};

module.exports = { generateQRCodes, zipQRCodes };
