import { Box, Typography } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";
import AxialViewer from "../components/viewer/AxialViewer";

export default function ViewerPage() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          MRI Viewer Area
        </Typography>
        <AxialViewer />
      </Box>
    </Box>
  );
}
