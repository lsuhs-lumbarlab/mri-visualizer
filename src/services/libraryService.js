// DICOM Library Service - Real Implementation (No Mock Data)
// This service will handle real DICOM uploads and IndexedDB storage

import db from '../database/db';
import { loadDicomFile } from './dicomLoader';
import { formatPatientName } from '../utils/patientNameFormatter';
import { formatDicomDate, calculateAge } from '../utils/dateTimeFormatter';

const libraryService = {
  // Get all patients from IndexedDB
  async listAccessiblePatients() {
    try {
      // Load all studies from IndexedDB
      const studies = await db.studies.toArray();
      
      // Group studies by patient
      const patientMap = new Map();
      
      for (const study of studies) {
        const patientId = study.patientID || 'UNKNOWN';
        
        if (!patientMap.has(patientId)) {
          // Create patient entry with properly formatted data
          patientMap.set(patientId, {
            id: patientId,
            name: formatPatientName(study.patientName), // Parse name properly
            dob: formatDicomDate(study.patientBirthDate), // Format birth date
            phiSummary: {
              patientId: patientId,
              sex: formatSex(study.patientSex), // Format sex/gender
              age: calculateAge(study.patientBirthDate),
            },
            metadata: {
              // These fields will be empty for now (no mock data)
              address: '',
              phone: '',
              email: '',
            },
            studies: [],
          });
        }
        
        // Add study to patient
        const patient = patientMap.get(patientId);
        patient.studies.push({
          id: study.studyInstanceUID,
          description: study.studyDescription || 'No Description',
          date: formatDicomDate(study.studyDate),
          modality: 'MR', // Default to MR for now
          metadata: {
            studyInstanceUID: study.studyInstanceUID,
            accessionNumber: '', // Will be populated from DICOM
            referringPhysician: '', // Will be populated from DICOM
          },
        });
      }
      
      // Convert map to array
      const patients = Array.from(patientMap.values());
      
      return {
        success: true,
        data: patients,
      };
    } catch (error) {
      console.error('Error loading patients from IndexedDB:', error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },

  // Upload DICOM files and store in IndexedDB
  async uploadDicomFolder(files, onProgress = null) {
    try {
      console.log(`Starting upload of ${files.length} files`);
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const totalFiles = files.length;
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // loadDicomFile will parse metadata and store in IndexedDB
          await loadDicomFile(file);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            filename: file.name,
            error: error.message,
          });
          console.error(`Error loading ${file.name}:`, error);
        }
        
        // Call progress callback if provided
        if (onProgress) {
          const progress = Math.round(((i + 1) / totalFiles) * 100);
          onProgress(progress);
        }
      }
      
      console.log(`Upload complete: ${successCount} success, ${errorCount} errors`);
      
      if (successCount === 0) {
        return {
          success: false,
          message: 'No DICOM files were successfully uploaded',
          errors: errors,
        };
      }
      
      // Get the uploaded patient info for success message
      const result = await this.listAccessiblePatients();
      const uploadedPatient = result.data[result.data.length - 1]; // Get most recent
      
      return {
        success: true,
        message: `Successfully uploaded ${successCount} DICOM file(s)`,
        successCount: successCount,
        errorCount: errorCount,
        errors: errorCount > 0 ? errors : null,
        patient: uploadedPatient,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: 'An error occurred during upload',
        error: error.message,
      };
    }
  },

  // Share patient (placeholder - will implement with backend)
  async sharePatient(patientId, targetEmail) {
    console.log(`TODO: Share patient ${patientId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Patient sharing will be implemented with backend',
    };
  },

  // Share study (placeholder - will implement with backend)
  async shareStudy(studyId, targetEmail) {
    console.log(`TODO: Share study ${studyId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Study sharing will be implemented with backend',
    };
  },
};

// Helper function to format DICOM sex/gender
function formatSex(dicomSex) {
  if (!dicomSex || dicomSex === 'U') return 'Unknown';
  
  const sexMap = {
    'M': 'Male',
    'F': 'Female',
    'O': 'Other',
    'U': 'Unknown',
  };
  
  return sexMap[dicomSex.toUpperCase()] || 'Unknown';
}

export default libraryService;