// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Box, Grid } from '@mui/material';
import QRCodeGenerator from './components/QRCodeGenerator';
import QRCodeScanner from './components/QRCodeScanner';
import AttendanceReport from './components/AttendanceReport';  // Import the new report component

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Grid container justifyContent="space-between">
            <Button color="inherit" component={Link} to="/generate">
              QR Code Generator
            </Button>
            <Button color="inherit" component={Link} to="/scan">
              QR Code Scanner
            </Button>
            <Button color="inherit" component={Link} to="/report">
              Attendance Report
            </Button>
          </Grid>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        <Box mt={4}>
          <Routes>
            <Route path="/generate" element={<QRCodeGenerator />} />
            <Route path="/scan" element={<QRCodeScanner />} />
            <Route path="/report" element={<AttendanceReport />} /> {/* Add the report route */}
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
