import * as dcmjs from 'dcmjs';
import { DicomStudy, DicomSeries, DicomImage } from '@/types/dicom.types';

const { DicomMetaDictionary } = dcmjs.data;

export async function parseDicomFiles(files: File[]): Promise<DicomStudy[]> {
  const studiesMap = new Map<string, DicomStudy>();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);
      const dataset = DicomMetaDictionary.naturalizeDataset(
        dcmjs.data.DicomMessage.readFile(byteArray).dict
      );

      const studyUID = dataset.StudyInstanceUID || 'unknown-study';
      const seriesUID = dataset.SeriesInstanceUID || 'unknown-series';

      // Get or create study
      if (!studiesMap.has(studyUID)) {
        studiesMap.set(studyUID, {
          studyInstanceUID: studyUID,
          studyDate: dataset.StudyDate || '',
          studyTime: dataset.StudyTime || '',
          studyDescription: dataset.StudyDescription || 'Unknown Study',
          patientName: dataset.PatientName || 'Unknown Patient',
          patientID: dataset.PatientID || '',
          series: [],
        });
      }

      const study = studiesMap.get(studyUID)!;

      // Get or create series
      let series = study.series.find((s) => s.seriesInstanceUID === seriesUID);
      if (!series) {
        const orientation = determineOrientation(dataset);
        series = {
          seriesInstanceUID: seriesUID,
          seriesNumber: dataset.SeriesNumber || 0,
          seriesDescription: dataset.SeriesDescription || 'Unknown Series',
          modality: dataset.Modality || 'MR',
          orientation,
          images: [],
        };
        study.series.push(series);
      }

      // Add image to series
      const imageId = `wadouri:${URL.createObjectURL(file)}`;
      series.images.push({
        imageId,
        instanceNumber: dataset.InstanceNumber || series.images.length,
        file,
      });
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error);
    }
  }

  // Sort images within each series by instance number
  studiesMap.forEach((study) => {
    study.series.forEach((series) => {
      series.images.sort((a, b) => a.instanceNumber - b.instanceNumber);
    });
  });

  return Array.from(studiesMap.values());
}

function determineOrientation(
  dataset: any
): 'sagittal' | 'axial' | 'coronal' | 'unknown' {
  const imageOrientation = dataset.ImageOrientationPatient;
  
  if (!imageOrientation || imageOrientation.length !== 6) {
    return 'unknown';
  }

  const rowCosines = imageOrientation.slice(0, 3);
  const colCosines = imageOrientation.slice(3, 6);

  // Calculate cross product to get slice normal
  const normal = [
    rowCosines[1] * colCosines[2] - rowCosines[2] * colCosines[1],
    rowCosines[2] * colCosines[0] - rowCosines[0] * colCosines[2],
    rowCosines[0] * colCosines[1] - rowCosines[1] * colCosines[0],
  ];

  // Determine primary axis
  const absNormal = normal.map(Math.abs);
  const maxAxis = absNormal.indexOf(Math.max(...absNormal));

  if (maxAxis === 0) return 'sagittal'; // X-axis
  if (maxAxis === 1) return 'coronal';  // Y-axis
  if (maxAxis === 2) return 'axial';    // Z-axis

  return 'unknown';
}