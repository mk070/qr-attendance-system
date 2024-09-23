import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [presentButtonEnabled, setPresentButtonEnabled] = useState(false); // Control visibility of Present button

  const handleScan = (data) => {
    if (data) {
      try {
        const studentData = JSON.parse(data); // QR code contains name and department
        setScanResult(studentData);
        setLoading(false); // Stop the loading once data is scanned
        setPresentButtonEnabled(true); // Enable the "Present" button
      } catch (error) {
        console.error('Error parsing scanned data:', error);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    setLoading(false);
  };

  const handleMarkPresent = async () => {
    if (!scanResult) return; // No scanned data, do nothing

    try {
      setLoading(true);
      const response = await axios.post('https://wild-emus-push.loca.lt/scan', {
        name: scanResult.name,
        department: scanResult.department,
        status: 'Present' // Mark as present when clicked
      });

      if (response.status === 200) {
        setSuccessMessage('Attendance marked successfully');
        setPresentButtonEnabled(false); // Disable button after marking present
      } else {
        console.error('Unexpected response:', response);
        setSuccessMessage('Error: Unexpected response from server');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setSuccessMessage('Error: ' + error.message);
    } finally {
      setLoading(false); // Ensure loading is stopped
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom align="center">
        Scan QR Code
      </Typography>

      <Grid container justifyContent="center">
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Box maxWidth="400px" mx="auto">
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
              constraints={{ facingMode: 'environment' }}
              style={{ width: '100%' }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} style={{ textAlign: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1" mt={2}>
              {successMessage || 'Waiting for scan...'}
            </Typography>
          )}
          {scanResult && (
            <Typography variant="body1" mt={2}>
              Scanned Data: {scanResult.name} ({scanResult.department})
            </Typography>
          )}
        </Grid>

        {presentButtonEnabled && (
          <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMarkPresent}
              disabled={loading} // Disable button while loading
            >
              Mark Present
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default QRCodeScanner;
