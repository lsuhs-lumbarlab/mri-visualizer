import { Drawer, List, ListItem, ListItemText } from "@mui/material";

export default function Sidebar() {
  return (
    <Drawer variant="permanent" sx={{ width: 240 }}>
      <List sx={{ mt: 8 }}>
        <ListItem>
          <ListItemText primary="Study Explorer" />
        </ListItem>
      </List>
    </Drawer>
  );
}
