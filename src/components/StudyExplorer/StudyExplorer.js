import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import db from '../../database/db';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  title: {
    fontSize: '1.5rem',  // Adjust title size here
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  studyItem: {
    paddingTop: theme.spacing(1),    // Adjust study item spacing here
    paddingBottom: theme.spacing(1),
  },
  nested: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.5),    // Adjust nested spacing here
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
    fontSize: '0.875rem',  // Adjust study name font size
    fontWeight: 500,
  },
  studySecondary: {
    fontSize: '0.875rem',   // Adjust study details font size
  },
  seriesPrimary: {
    fontSize: '0.8rem',    // Adjust series name font size
  },
  seriesSecondary: {
    fontSize: '0.8rem',    // Adjust series details font size
  },
}));

const StudyExplorer = ({ onSeriesSelect }) => {
  const classes = useStyles();
  const [studies, setStudies] = useState([]);
  const [openStudies, setOpenStudies] = useState({});
  const [selectedSeries, setSelectedSeries] = useState({});

  useEffect(() => {
    // Load studies whenever component mounts
    loadStudies();
  }, []); // Empty dependency array means this runs on mount

  const loadStudies = async () => {
    try {
      const allStudies = await db.studies.toArray();
      const studiesWithSeries = await Promise.all(
        allStudies.map(async (study) => {
          const series = await db.series
            .where('studyInstanceUID')
            .equals(study.studyInstanceUID)
            .toArray();
          return { ...study, series };
        })
      );
      setStudies(studiesWithSeries);
      
      // Auto-expand first study
      if (studiesWithSeries.length > 0) {
        setOpenStudies({ [studiesWithSeries[0].studyInstanceUID]: true });
      }
      
      // Reset selected series
      setSelectedSeries({});
    } catch (error) {
      console.error('Error loading studies:', error);
    }
  };

  const handleStudyClick = (studyUID) => {
    setOpenStudies((prev) => ({
      ...prev,
      [studyUID]: !prev[studyUID],
    }));
  };

  const handleSeriesClick = async (series) => {
    setSelectedSeries((prev) => ({
      ...prev,
      [series.orientation]: series.seriesInstanceUID,
    }));
    onSeriesSelect(series);
  };

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>
        Study Explorer
      </Typography>
      <List dense>
        {studies.map((study) => (
          <React.Fragment key={study.studyInstanceUID}>
            <ListItem 
              button 
              onClick={() => handleStudyClick(study.studyInstanceUID)}
              className={classes.studyItem}
            >
              <ListItemText
                primary={study.patientName || 'Unknown Patient'}
                secondary={`${study.studyDate || 'No date'} - ${
                  study.studyDescription || 'No description'
                }`}
                primaryTypographyProps={{ className: classes.studyPrimary }}
                secondaryTypographyProps={{ className: classes.studySecondary }}
              />
              {openStudies[study.studyInstanceUID] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={openStudies[study.studyInstanceUID]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense>
                {study.series.map((series) => (
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
                      secondary={`Series ${series.seriesNumber || 'N/A'}`}
                      primaryTypographyProps={{ className: classes.seriesPrimary }}
                      secondaryTypographyProps={{ className: classes.seriesSecondary }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default StudyExplorer;