export interface DicomImage {
  imageId: string;
  instanceNumber: number;
  file: File;
}

export interface DicomSeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  orientation: 'sagittal' | 'axial' | 'coronal' | 'unknown';
  images: DicomImage[];
}

export interface DicomStudy {
  studyInstanceUID: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  patientName: string;
  patientID: string;
  series: DicomSeries[];
}

export interface ViewportInfo {
  orientation: 'sagittal' | 'axial' | 'coronal';
  currentSlice: number;
  totalSlices: number;
  windowWidth: number;
  windowLevel: number;
  zoom: number;
}