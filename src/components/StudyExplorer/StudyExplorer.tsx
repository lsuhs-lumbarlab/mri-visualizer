import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Chip,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useDicomStore } from '@/store/dicomStore';
import type { DicomStudy, DicomSeries } from '@/types/dicom.types';

const StudyExplorer: React.FC = () => {
  const studies = useDicomStore((state) => state.studies);
  const selectSeries = useDicomStore((state) => state.selectSeries);
  const [expandedStudies, setExpandedStudies] = React.useState<string[]>([]);

  const handleStudyClick = (studyUID: string) => {
    setExpandedStudies((prev) =>
      prev.includes(studyUID)
        ? prev.filter((uid) => uid !== studyUID)
        : [...prev, studyUID]
    );
  };

  const handleSeriesClick = (series: DicomSeries) => {
    // Skip series with unknown orientation
    if (series.orientation === 'unknown') {
      console.warn(`Cannot load series with unknown orientation: ${series.seriesDescription}`);
      alert('This series has an unknown orientation and cannot be displayed');
      return;
    }

    // Load series into the appropriate viewport based on orientation
    selectSeries(series.orientation, series);
    console.log(`Selected ${series.orientation} series: ${series.seriesDescription}`);
  };

  const getOrientationColor = (orientation: string) => {
    switch (orientation) {
      case 'sagittal':
        return 'primary';
      case 'axial':
        return 'secondary';
      case 'coronal':
        return 'success';
      default:
        return 'default';
    }
  };

  if (studies.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">No studies loaded</Typography>
        <Typography variant="caption">Upload DICOM files to begin</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'auto', maxHeight: '100%' }}>
      <List dense>
        {studies.map((study: DicomStudy) => {
          const isExpanded = expandedStudies.includes(study.studyInstanceUID);
          
          return (
            <React.Fragment key={study.studyInstanceUID}>
              {/* Study Header */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleStudyClick(study.studyInstanceUID)}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="bold">
                        {study.patientName || 'Unknown Patient'}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {study.studyDate} - {study.studyDescription}
                      </Typography>
                    }
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              {/* Series List */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  {study.series.map((series: DicomSeries) => (
                    <ListItem
                      key={series.seriesInstanceUID}
                      disablePadding
                      sx={{ pl: 2 }}
                    >
                      <ListItemButton
                        onClick={() => handleSeriesClick(series)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {series.seriesDescription}
                              </Typography>
                              <Chip
                                label={series.orientation.toUpperCase()}
                                size="small"
                                color={getOrientationColor(series.orientation)}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {series.images.length} images
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default StudyExplorer;