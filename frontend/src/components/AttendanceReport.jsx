import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.API_URL}/attendance`);
        setAttendanceData(response.data);
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
                      <TableCell>{entry.Name}</TableCell>
                      <TableCell>{entry["Reg No"]}</TableCell>
                      <TableCell>{entry.College}</TableCell>
                      <TableCell>{entry.Department}</TableCell>
                      <TableCell>{entry["Domain Email ID (College ID)"]}</TableCell>
                      <TableCell>{entry["Whatsapp Number"]}</TableCell>
                      <TableCell>{entry.status}</TableCell>
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
