import { Button, Container, Typography } from "@mui/material";

function App() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        🧠 MRI Visualizer
      </Typography>
      <Button variant="contained" color="primary">
        Upload DICOM
      </Button>
    </Container>
  );
}

export default App;
