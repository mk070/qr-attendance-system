const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const cors = require('cors');

const { generateQRCodes, zipQRCodes } = require('./qrGenerator');  // Import the QR generator functions
const { sendEmailsWithQRCodes } = require('./emailSender');  // Import the email sender

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to the Excel file
const filePath = path.join(__dirname, 'Final NameList - GenAI Hackathon Registration - SNSCT.xlsx');

// Initialize the Excel file if it doesn't exist
const initializeExcelFile = () => {
  if (!fs.existsSync(filePath)) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(wb, ws, 'SNSCT');
    xlsx.writeFile(wb, filePath);
  }
};

// Ensure the Excel file exists
initializeExcelFile();

app.get("/",(req,res)=>{
  res.send(`Backend server is running successfully`)
})

// Route to trigger QR code email sending
app.get('/send-qr-codes', (req, res) => {
  try {
    sendEmailsWithQRCodes();
    res.json({ message: 'QR codes are being sent to students.' });
  } catch (error) {
    console.error('Error sending QR codes:', error);
    res.status(500).json({ error: 'Failed to send QR codes.' });
  }
});

// Function to add or update student attendance in the Excel sheet
// Function to add or update student attendance in the Excel sheet
// Function to add or update student attendance in the "SNSCT" sheet
const updateAttendance = (studentData) => {
  const workbook = xlsx.readFile(filePath);

  // Access the "SNSCT" sheet
  const worksheet = workbook.Sheets["SNSCT"];
  if (!worksheet) {
    console.error("Error: 'SNSCT' sheet not found");
    return;
  }

  let attendanceData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  // Ensure the 'attendance-status' column exists for all entries
  attendanceData = attendanceData.map(entry => ({
    ...entry,
    'attendance-status': entry['attendance-status'] || 'Absent'  // Default to 'Absent' if no status
  }));

  // Check if the student exists by matching Name and Reg No
  const studentIndex = attendanceData.findIndex(
    entry => entry.Name === studentData.name && entry["Reg No"] === studentData.regNo
  );

  if (studentIndex > -1) {
    // Update the student's attendance status to 'Present'
    attendanceData[studentIndex]['attendance-status'] = studentData.status;
  } else {
    // If not found, you could add a new student or log an error
    console.error(`Student not found: ${studentData.name}`);
  }

  // Write the updated data back to the "SNSCT" sheet
  const updatedSheet = xlsx.utils.json_to_sheet(attendanceData);
  workbook.Sheets["SNSCT"] = updatedSheet;
  xlsx.writeFile(workbook, filePath);
};


// Route to handle QR code scanning and updating attendance
app.post('/scan', (req, res) => {
  // Log incoming data for debugging
  console.log('Received data:', req.body);

  const { name, regNo, college, department } = req.body;  // Include the college field

  // Validate that the required fields are present
  if (!name || !regNo || !college || !department) {
    console.error('Incomplete student data:', req.body);
    return res.status(400).json({ error: 'Incomplete student data' });
  }

  const studentData = {
    name,
    regNo,
    college,  // Include college in the student data
    department,
    status: 'Present'  // Mark the student as "Present"
  };

  try {
    // Call function to update attendance in the database or file
    updateAttendance(studentData);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Route to fetch attendance data and include the attendance status
app.get('/attendance', (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let attendanceData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

      // Modify or add 'status' column for each student
      attendanceData = attendanceData.map((student) => ({
        ...student,
        status: student.status || 'Absent', // Default to 'Absent' if no status is found
      }));

      res.json(attendanceData); // Send the attendance data as JSON to the frontend
    } else {
      res.status(404).json({ error: 'Attendance file not found' });
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Failed to fetch attendance data' });
  }
});

// Route to generate QR codes
app.get('/generate-qr-codes', (req, res) => {
  try {
    generateQRCodes();
    res.json({ message: 'QR codes are being generated.' });
  } catch (error) {
    console.error('Error generating QR codes:', error);
    res.status(500).json({ error: 'Failed to generate QR codes.' });
  }
});

// Route to download all QR codes as a zip file
app.get('/download-qr-codes', (req, res) => {
  zipQRCodes(res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
