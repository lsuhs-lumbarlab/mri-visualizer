import React, { useCallback } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { parseDicomFiles } from '@/services/dicom/dicomParser';
import { useDicomStore } from '@/store/dicomStore';

const UploadZone: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const { addStudy } = useDicomStore();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      
      console.log(`Total files selected: ${fileArray.length}`);
      
      // Filter for DICOM files
      const dicomFiles = fileArray.filter(file => {
        // Must have size (not empty)
        if (file.size === 0) {
          return false;
        }
        
        const fileName = file.name.toLowerCase();
        
        // Accept .dcm extension
        if (fileName.endsWith('.dcm')) {
          return true;
        }
        
        // Accept files with no extension (common for DICOM)
        if (!fileName.includes('.')) {
          return true;
        }
        
        return false;
      });
      
      console.log(`Filtered DICOM files: ${dicomFiles.length}`);
      
      if (dicomFiles.length === 0) {
        console.warn('No DICOM files found');
        alert('No DICOM files found in the selected files/folder');
        return;
      }
      
      console.log(`Processing ${dicomFiles.length} DICOM files...`);
      const studies = await parseDicomFiles(dicomFiles);
      
      studies.forEach((study) => addStudy(study));
      
      console.log(`Loaded ${studies.length} studies from ${dicomFiles.length} images`);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing DICOM files. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  }, [addStudy]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const onFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <Box sx={{ p: 2 }}>
      {isUploading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Processing...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<InsertDriveFileIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Open File
            <input
              type="file"
              hidden
              multiple
              accept=".dcm"
              onChange={onFileSelect}
            />
          </Button>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<FolderOpenIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Open Folder
            <input
              type="file"
              hidden
              // @ts-ignore - webkitdirectory is not in TypeScript types but works in browsers
              webkitdirectory="true"
              multiple
              onChange={onFolderSelect}
            />
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UploadZone;