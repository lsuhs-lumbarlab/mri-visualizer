// DICOM Library Service - Real Implementation (No Mock Data)
// This service will handle real DICOM uploads and IndexedDB storage

import db from '../database/db';
import { loadDicomFile } from './dicomLoader';

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
          // Create patient entry
          patientMap.set(patientId, {
            id: patientId,
            name: study.patientName || 'Unknown Patient',
            dob: study.patientBirthDate || '',
            phiSummary: {
              patientId: patientId,
              sex: study.patientSex || 'U',
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
          date: formatStudyDate(study.studyDate),
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
  async uploadDicomFolder(files) {
    try {
      console.log(`Starting upload of ${files.length} files`);
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Process each file
      for (const file of files) {
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

// Helper function to calculate age from birth date
function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  try {
    // DICOM date format is YYYYMMDD
    const year = parseInt(birthDate.substring(0, 4));
    const month = parseInt(birthDate.substring(4, 6));
    const day = parseInt(birthDate.substring(6, 8));
    
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
}

// Helper function to format study date for display
function formatStudyDate(studyDate) {
  if (!studyDate) return '';
  
  try {
    // DICOM date format is YYYYMMDD
    const year = studyDate.substring(0, 4);
    const month = studyDate.substring(4, 6);
    const day = studyDate.substring(6, 8);
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return studyDate;
  }
}

export default libraryService;