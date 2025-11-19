import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import db from '../database/db';

/**
 * Check if a file is a DICOM file by reading its header
 * DICOM files have 'DICM' at bytes 128-131
 */
export const isDicomFile = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        
        // Check for DICOM magic number 'DICM' at offset 128
        if (byteArray.length >= 132) {
          const dicm = String.fromCharCode(
            byteArray[128],
            byteArray[129],
            byteArray[130],
            byteArray[131]
          );
          
          if (dicm === 'DICM') {
            resolve(true);
            return;
          }
        }
        
        // Try parsing as DICOM (some files may not have the preamble)
        try {
          dicomParser.parseDicom(byteArray);
          resolve(true);
          return;
        } catch (e) {
          // Not a valid DICOM file
        }
        
        resolve(false);
      } catch (error) {
        resolve(false);
      }
    };
    
    reader.onerror = () => resolve(false);
    
    // Read first 1KB to check header
    reader.readAsArrayBuffer(file.slice(0, 1024));
  });
};

/**
 * Load DICOM file and extract metadata
 */
export const loadDicomFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Parse DICOM file
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        // Extract metadata
        const metadata = extractMetadata(dataSet);
        
        // Create image ID for cornerstone
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        
        // Store in IndexedDB
        await storeFileData(file, metadata, imageId, arrayBuffer);

        resolve({ imageId, metadata });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extract DICOM metadata
 */
const extractMetadata = (dataSet) => {
  const getString = (tag) => {
    try {
      const element = dataSet.elements[tag];
      return element ? dataSet.string(tag) : '';
    } catch (e) {
      return '';
    }
  };

  const getNumber = (tag) => {
    try {
      const element = dataSet.elements[tag];
      return element ? dataSet.floatString(tag) : null;
    } catch (e) {
      return null;
    }
  };

  return {
    // Patient Information
    patientName: getString('x00100010'),
    patientID: getString('x00100020'),
    patientBirthDate: getString('x00100030'),
    patientSex: getString('x00100040'),

    // Study Information
    studyInstanceUID: getString('x0020000d'),
    studyDate: getString('x00080020'),
    studyTime: getString('x00080030'),
    studyDescription: getString('x00081030'),

    // Series Information
    seriesInstanceUID: getString('x0020000e'),
    seriesNumber: getString('x00200011'),
    seriesDescription: getString('x0008103e'),
    modality: getString('x00080060'),

    // Image Information
    sopInstanceUID: getString('x00080018'),
    instanceNumber: getString('x00200013'),
    
    // Image Orientation and Position
    imageOrientationPatient: getString('x00200037'),
    imagePositionPatient: getString('x00200032'),
    sliceLocation: getNumber('x00201041'),
    sliceThickness: getNumber('x00180050'),

    // Image Dimensions
    rows: getNumber('x00280010'),
    columns: getNumber('x00280011'),
    pixelSpacing: getString('x00280030'),

    // Window/Level
    windowCenter: getNumber('x00281050'),
    windowWidth: getNumber('x00281051'),
  };
};

/**
 * Store file data in IndexedDB
 */
const storeFileData = async (file, metadata, imageId, arrayBuffer) => {
  // Store file reference
  await db.files.add({
    name: file.name,
    type: file.type,
    sopInstanceUID: metadata.sopInstanceUID,
    seriesInstanceUID: metadata.seriesInstanceUID,
    studyInstanceUID: metadata.studyInstanceUID,
    imageId: imageId,
  });

  // Store study
  await db.studies.put({
    studyInstanceUID: metadata.studyInstanceUID,
    patientName: metadata.patientName,
    patientID: metadata.patientID,
    studyDate: metadata.studyDate,
    studyDescription: metadata.studyDescription,
  });

  // Store series with orientation
  const orientation = determineOrientation(metadata.imageOrientationPatient);
  await db.series.put({
    seriesInstanceUID: metadata.seriesInstanceUID,
    studyInstanceUID: metadata.studyInstanceUID,
    seriesNumber: metadata.seriesNumber,
    seriesDescription: metadata.seriesDescription,
    modality: metadata.modality,
    orientation: orientation,
  });
};

/**
 * Determine image orientation (Sagittal, Axial, Coronal)
 */
const determineOrientation = (imageOrientationPatient) => {
  if (!imageOrientationPatient) return 'UNKNOWN';

  const values = imageOrientationPatient.split('\\').map(parseFloat);
  if (values.length !== 6) return 'UNKNOWN';

  const rowCosines = [values[0], values[1], values[2]];
  const colCosines = [values[3], values[4], values[5]];

  // Calculate cross product to get slice normal
  const normal = [
    rowCosines[1] * colCosines[2] - rowCosines[2] * colCosines[1],
    rowCosines[2] * colCosines[0] - rowCosines[0] * colCosines[2],
    rowCosines[0] * colCosines[1] - rowCosines[1] * colCosines[0],
  ];

  // Find dominant axis
  const absNormal = normal.map(Math.abs);
  const maxIndex = absNormal.indexOf(Math.max(...absNormal));

  // Determine orientation based on dominant axis
  if (maxIndex === 0) return 'SAGITTAL';  // X-axis (left-right)
  if (maxIndex === 1) return 'CORONAL';   // Y-axis (anterior-posterior)
  if (maxIndex === 2) return 'AXIAL';     // Z-axis (superior-inferior)

  return 'UNKNOWN';
};

/**
 * Load image stack for a series
 */
export const loadSeriesImageStack = async (seriesInstanceUID) => {
  // Get all files for this series
  const files = await db.files
    .where('seriesInstanceUID')
    .equals(seriesInstanceUID)
    .toArray();

  // Load images and sort by instance number or slice location
  const imagePromises = files.map(async (file) => {
    const image = await cornerstone.loadImage(file.imageId);
    return {
      imageId: file.imageId,
      image: image,
    };
  });

  const images = await Promise.all(imagePromises);

  // Sort by instance number (stored in image metadata)
  images.sort((a, b) => {
    const aInstance = parseInt(a.image.data.string('x00200013') || '0');
    const bInstance = parseInt(b.image.data.string('x00200013') || '0');
    return aInstance - bInstance;
  });

  return images.map(img => img.imageId);
};