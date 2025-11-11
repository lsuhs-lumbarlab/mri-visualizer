import { Box, Typography } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";

export default function ViewerPage() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5">MRI Viewer Area</Typography>
      </Box>
    </Box>
  );
}
