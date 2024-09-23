const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Set up the file path for the Excel file
const filePath = path.join(__dirname, 'attendance.xlsx');

// Initialize the Excel file if it doesn't exist
const initializeExcelFile = () => {
  if (!fs.existsSync(filePath)) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(wb, ws, 'Attendance');
    xlsx.writeFile(wb, filePath);
  }
};

// Ensure the Excel file exists
initializeExcelFile();

// Function to add or update student attendance in the Excel sheet
const updateAttendance = (studentData) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets['Attendance'];
  const attendanceData = xlsx.utils.sheet_to_json(worksheet);

  // Check if the student is already in the sheet
  const studentIndex = attendanceData.findIndex((entry) => entry.name === studentData.name);

  if (studentIndex > -1) {
    // Update existing student's attendance status
    attendanceData[studentIndex] = studentData;
  } else {
    // Add new student
    attendanceData.push(studentData);
  }

  const updatedSheet = xlsx.utils.json_to_sheet(attendanceData);
  workbook.Sheets['Attendance'] = updatedSheet;
  xlsx.writeFile(workbook, filePath);
};

// Route to handle QR code scanning and updating attendance
app.post('/scan', (req, res) => {
  const { name, department } = req.body;

  // Validate that the required fields are present
  if (!name || !department) {
    return res.status(400).json({ error: 'Incomplete student data' });
  }

  const studentData = {
    name,
    department,
    status: 'Present'  // Mark the student as "Present"
  };

  try {
    updateAttendance(studentData);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Route to download the attendance Excel file
app.get('/attendance', (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'attendance.xlsx');
    } else {
      res.status(404).json({ error: 'Attendance file not found' });
    }
  } catch (error) {
    console.error('Error downloading attendance file:', error);
    res.status(500).json({ error: 'Failed to download attendance file' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
