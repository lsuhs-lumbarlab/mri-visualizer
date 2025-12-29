import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import db from '../database/db';
import { formatPatientName } from '../utils/patientNameFormatter';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  studyItem: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  nested: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  seriesItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selected: {
    backgroundColor: theme.palette.action.selected,
  },
  // Custom text sizing for list items
  studyPrimary: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  studySecondary: {
    fontSize: '0.875rem',
  },
  seriesPrimary: {
    fontSize: '0.8rem',
  },
  seriesSecondary: {
    fontSize: '0.8rem',
  },
}));

const StudyExplorer = ({ studyInstanceUID, onSeriesSelect }) => {
  const classes = useStyles();
  const [study, setStudy] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState({});

  useEffect(() => {
    // Load the specific study whenever studyInstanceUID changes
    if (studyInstanceUID) {
      loadStudy(studyInstanceUID);
    }
  }, [studyInstanceUID]);

  const loadStudy = async (uid) => {
    try {
      // Load the specific study from IndexedDB
      const studyData = await db.studies.get(uid);
      
      if (!studyData) {
        console.error('Study not found:', uid);
        return;
      }

      // Load all series for this study
      const series = await db.series
        .where('studyInstanceUID')
        .equals(uid)
        .toArray();

      // Combine study and series data
      const studyWithSeries = {
        ...studyData,
        series: series,
      };

      setStudy(studyWithSeries);
      setIsOpen(true); // Auto-expand the study
      setSelectedSeries({}); // Reset selected series
      
      console.log('Study loaded in explorer:', studyWithSeries);
    } catch (error) {
      console.error('Error loading study in explorer:', error);
    }
  };

  const handleStudyClick = () => {
    setIsOpen(prev => !prev);
  };

  const handleSeriesClick = async (series) => {
    setSelectedSeries((prev) => ({
      ...prev,
      [series.orientation]: series.seriesInstanceUID,
    }));
    onSeriesSelect(series);
  };

  if (!study) {
    return (
      <Box className={classes.root}>
        <Typography className={classes.title}>
          Study Explorer
        </Typography>
        <Typography variant="body2" style={{ padding: 16, textAlign: 'center' }}>
          Loading study...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>
        Study Explorer
      </Typography>
      <List dense>
        <React.Fragment key={study.studyInstanceUID}>
          <ListItem 
            button 
            onClick={handleStudyClick}
            className={classes.studyItem}
          >
            <ListItemText
              primary={formatPatientName(study.patientName)}
              secondary={`${study.studyDate || 'No date'} - ${
                study.studyDescription || 'No description'
              }`}
              primaryTypographyProps={{ className: classes.studyPrimary }}
              secondaryTypographyProps={{ className: classes.studySecondary }}
            />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense>
              {study.series.length === 0 ? (
                <ListItem className={classes.nested}>
                  <ListItemText
                    primary="No series available"
                    primaryTypographyProps={{ className: classes.seriesPrimary }}
                  />
                </ListItem>
              ) : (
                study.series.map((series) => (
                  <ListItem
                    key={series.seriesInstanceUID}
                    button
                    className={`${classes.nested} ${classes.seriesItem} ${
                      selectedSeries[series.orientation] === series.seriesInstanceUID
                        ? classes.selected
                        : ''
                    }`}
                    onClick={() => handleSeriesClick(series)}
                  >
                    <ListItemText
                      primary={`${series.orientation} - ${series.seriesDescription || 'No description'}`}
                      secondary={`Series ${series.seriesNumber || 'N/A'} - ${series.modality || 'N/A'}`}
                      primaryTypographyProps={{ className: classes.seriesPrimary }}
                      secondaryTypographyProps={{ className: classes.seriesSecondary }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Collapse>
        </React.Fragment>
      </List>
    </Box>
  );
};

export default StudyExplorer;