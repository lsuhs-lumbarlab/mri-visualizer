import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 200,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  viewportArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

const MainLayout = ({ header, sidebar, viewports }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {header}
      <Box className={classes.content}>
        {sidebar && <Box className={classes.sidebar}>{sidebar}</Box>}
        <Box className={classes.viewportArea}>{viewports}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;