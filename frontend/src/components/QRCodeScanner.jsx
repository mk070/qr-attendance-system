import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { Box, Typography, Grid, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import axios from 'axios';

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);  // Store scanned data as an object
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);  // Control the scanning state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Handle error messages
  const [constraints, setConstraints] = useState({ facingMode: 'environment' });  // Default to rear camera

  // Check for available cameras and adjust the facingMode constraint
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length > 1) {
        setConstraints({ facingMode: 'environment' });  // Use rear camera if available
      } else {
        setConstraints({ facingMode: 'user' });  // Use front camera if no rear camera
      }
    });
  }, []);

  // Handle QR Code Scanning
  const handleScan = (data) => {
    if (data) {
      try {
        const studentData = JSON.parse(data);  // Assuming QR code contains JSON with 'name', 'regNo', 'college', 'department', 'round1', 'round2', 'round3'
        if (studentData.name && studentData.regNo && studentData.college) {
          studentData.department = studentData.department || 'N/A';  // Optional: Set a default value for department if it's missing
          studentData.round1 = studentData.round1 || 'Pending';  // Default 'Pending' if round1 is missing
          studentData.round2 = studentData.round2 || 'Pending';  // Default 'Pending' if round2 is missing
          studentData.round3 = studentData.round3 || 'Pending';  // Default 'Pending' if round3 is missing
          setScanResult(studentData);  // Store scanned student data
          setLoading(false);
          setErrorMessage('');  // Clear any previous error
          setScanning(false);  // Stop the scanner
        } else {
          throw new Error('Invalid QR code data');
        }
      } catch (error) {
        setErrorMessage('Failed to parse QR code. Make sure it contains valid JSON.');
        setScanResult(null);
        setLoading(false);
      }
    }
  };

  const handleError = (error) => {
    if (error.name === 'NotAllowedError') {
      setErrorMessage('Camera access was denied. Please allow access to the camera.');
    } else if (error.name === 'NotFoundError') {
      setErrorMessage('No camera device found. Please make sure your device has a camera.');
    } else {
      setErrorMessage('Scan QR: ' + error.message);
    }
    console.error('Scan QR:', error);
    setLoading(false);
  };

  // Mark Attendance as Present
  const handleMarkPresent = async () => {
    if (!scanResult) return;  // No scanned data, do nothing

    try {
      setLoading(true);
      setErrorMessage('');  // Clear any previous errors

      // POST request to mark the student as present
      const response = await axios.post(`https://b543-2401-4900-4ac8-c5b1-21dc-a76c-55fe-25cb.ngrok-free.app/scan`, {
        name: scanResult.name,
        regNo: scanResult.regNo,
        department: scanResult.department,
        college: scanResult.college,
        round1: scanResult.round1,
        round2: scanResult.round2,
        round3: scanResult.round3
      });
      
      if (response.status === 200) {
        setSuccessMessage('Attendance marked successfully');
        setScanResult(null);  // Reset the scanned result
      } else if (response.status === 400) {
        setErrorMessage('Incomplete student data. Please check the scanned QR code.');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setErrorMessage('Error marking attendance: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);  // Ensure loading stops
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom align="center">
        QR Code Attendance Scanner
      </Typography>

      <Grid container justifyContent="center">
        <Grid item xs={12} style={{ textAlign: 'center' }}>

          {/* Show Start Scan Button if not scanning */}
          {!scanning && !scanResult && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                setScanResult(null);
                setScanning(true);  // Start scanning when button is clicked
              }}
            >
              Start Scan
            </Button>
          )}

          {/* Show the QR Code Reader if scanning */}
          {scanning && (
            <Box maxWidth="400px" mx="auto" mt={2}>
              <QrReader
                delay={300}
                onResult={(result, error) => {
                  if (!!result) {
                    handleScan(result?.text);
                  }
                  if (!!error) {
                    handleError(error);
                  }
                }}
                constraints={constraints}  // Dynamically set based on available cameras
                style={{ width: '100%' }}
              />
            </Box>
          )}
        </Grid>

        {/* Display scan results if available */}
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {errorMessage && (
                <Typography variant="body1" color="error" mt={2}>
                  {errorMessage}
                </Typography>
              )}
              {successMessage ? (
                <Typography variant="body1" color="primary" mt={2}>
                  {successMessage}
                </Typography>
              ) : (
                scanResult && (
                  <>
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>{scanResult.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Reg No</TableCell>
                            <TableCell>{scanResult.regNo}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>College</TableCell>
                            <TableCell>{scanResult.college}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Department</TableCell>
                            <TableCell>{scanResult.department}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Round 1</TableCell>
                            <TableCell>{scanResult.round1}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Round 2</TableCell>
                            <TableCell>{scanResult.round2}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Round 3</TableCell>
                            <TableCell>{scanResult.round3}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Show Mark Present Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleMarkPresent}
                      disabled={loading || !scanResult}  // Disable button while loading or if no data
                      style={{ marginTop: '20px' }}
                    >
                      Mark Present
                    </Button>
                  </>
                )
              )}
            </>
          )}
        </Grid>

        {/* After successfully marking attendance, show the Start Scan button again */}
        {successMessage && (
          <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                setScanning(true);  // Restart scanning
              }}
            >
              Start New Scan
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default QRCodeScanner;
