import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
}));

const Header = ({ onOpenFiles }) => {
  const classes = useStyles();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onOpenFiles) {
      onOpenFiles(files);
    }
  };

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          MRI Visualizer - Lumbar Spine
        </Typography>
        <input
          accept=".dcm"
          style={{ display: 'none' }}
          id="upload-button"
          multiple
          type="file"
          webkitdirectory=""
          directory=""
          onChange={handleFileSelect}
        />
        <label htmlFor="upload-button">
          <IconButton color="inherit" component="span">
            <FolderOpenIcon />
          </IconButton>
        </label>
      </Toolbar>
    </AppBar>
  );
};

export default Header;