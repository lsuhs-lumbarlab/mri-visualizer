import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import db from '../../database/db';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  nested: {
    paddingLeft: theme.spacing(4),
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
}));

const StudyExplorer = ({ onSeriesSelect }) => {
  const classes = useStyles();
  const [studies, setStudies] = useState([]);
  const [openStudies, setOpenStudies] = useState({});
  const [selectedSeries, setSelectedSeries] = useState({});

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
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
      <Box p={2}>
        <Typography variant="h6">Study Explorer</Typography>
      </Box>
      <List>
        {studies.map((study) => (
          <React.Fragment key={study.studyInstanceUID}>
            <ListItem button onClick={() => handleStudyClick(study.studyInstanceUID)}>
              <ListItemText
                primary={study.patientName || 'Unknown Patient'}
                secondary={`${study.studyDate || 'No date'} - ${
                  study.studyDescription || 'No description'
                }`}
              />
              {openStudies[study.studyInstanceUID] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={openStudies[study.studyInstanceUID]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
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