import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles((theme) => ({
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 400,
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(4),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.light,
    },
  },
  icon: {
    fontSize: 64,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

const FileUploader = ({ onFilesSelected }) => {
  const classes = useStyles();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    input.accept = '.dcm';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    };
    input.click();
  };

  return (
    <Paper
      className={classes.dropZone}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <CloudUploadIcon className={classes.icon} />
      <Typography variant="h5" gutterBottom>
        Drop DICOM files here
      </Typography>
      <Typography variant="body2" color="textSecondary">
        or click to browse
      </Typography>
    </Paper>
  );
};

export default FileUploader;