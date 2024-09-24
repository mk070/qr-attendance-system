import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://4265-2401-4900-4a96-2910-e8f3-8978-a4a3-3f77.ngrok-free.app/attendance`);
        console.log('API Response:', response.data); // Log API response for debugging
        
        // Ensure response data is an array
        setAttendanceData(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadExcel = () => {
    if (attendanceData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(attendanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    XLSX.writeFile(workbook, 'Attendance_Report.xlsx');
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom align="center">
        Attendance Report
      </Typography>

      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="body1">Below is the generated attendance data:</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Reg No</TableCell>
                    <TableCell>College</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Whatsapp Number</TableCell>
                    <TableCell>Attendance Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.Name || 'N/A'}</TableCell>
                      <TableCell>{entry["Reg No"] || 'N/A'}</TableCell>
                      <TableCell>{entry.College || 'N/A'}</TableCell>
                      <TableCell>{entry.Department || 'N/A'}</TableCell>
                      <TableCell>{entry["Domain Email ID (College ID)"] || 'N/A'}</TableCell>
                      <TableCell>{entry["Whatsapp Number"] || 'N/A'}</TableCell>
                      <TableCell>{entry.status || 'Absent'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={downloadExcel}
              disabled={attendanceData.length === 0}
            >
              Download Attendance Report as Excel
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AttendanceReport;
