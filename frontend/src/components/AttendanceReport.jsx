// AttendanceReport.jsx
import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, CircularProgress } from '@mui/material';
import * as XLSX from 'xlsx';
import axios from 'axios';  // Use this to fetch data from API

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state to show spinner

  // This effect will later fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // When the API is ready, replace the URL with the actual API endpoint
        const response = await axios.get('https://rotten-groups-lie.loca.lt/attendance');
        setAttendanceData(response.data);  // Update the state with API data
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
            <Typography variant="body1">
              Below is the generated attendance data:
            </Typography>
            {attendanceData.length > 0 ? (
              <ul>
                {attendanceData.map((entry, index) => (
                  <li key={index}>
                    {entry.name} ({entry.department}) - {entry.status}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2">No attendance data available.</Typography>
            )}
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
