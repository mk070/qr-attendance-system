// QRCodeGenerator.jsx
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { TextField, Button, Box, Typography, Grid } from '@mui/material';

const QRCodeGenerator = () => {
  const [student, setStudent] = useState({ name: '', department: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom align="center">
        Generate QR Code
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            label="Student Name"
            name="name"
            value={student.name}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Department"
            name="department"
            value={student.department}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <QRCodeCanvas value={JSON.stringify(student)} size={200} />
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Button variant="contained" color="primary" size="large">
            Generate QR Code
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QRCodeGenerator;
