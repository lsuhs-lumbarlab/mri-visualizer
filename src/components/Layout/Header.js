import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import GridOnIcon from '@material-ui/icons/GridOn';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  activeButton: {
    color: theme.palette.primary.light,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Header = ({ onOpenFiles, referenceLinesEnabled, onToggleReferenceLines, onLogout }) => {
  const classes = useStyles();

  const handleOpenFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        onOpenFiles(files);
      }
    };
    
    input.click();
  };

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          MRI Visualizer
        </Typography>
        
        <Tooltip title="Open DICOM Folder">
          <IconButton 
            color="inherit" 
            onClick={handleOpenFolder}
            className={classes.button}
          >
            <FolderOpenIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={referenceLinesEnabled ? "Hide Reference Lines" : "Show Reference Lines"}>
          <IconButton 
            color="inherit" 
            onClick={onToggleReferenceLines}
            className={`${classes.button} ${referenceLinesEnabled ? classes.activeButton : ''}`}
          >
            <GridOnIcon />
          </IconButton>
        </Tooltip>

        {onLogout && (
          <Tooltip title="Logout">
            <IconButton 
              color="inherit" 
              onClick={onLogout}
              className={classes.button}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;