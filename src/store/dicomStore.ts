import { create } from 'zustand';
import { DicomStudy, DicomSeries, ViewportInfo } from '@/types/dicom.types';

interface DicomStore {
  studies: DicomStudy[];
  selectedSeries: {
    sagittal: DicomSeries | null;
    axial: DicomSeries | null;
    coronal: DicomSeries | null;
  };
  viewportInfo: {
    sagittal: ViewportInfo;
    axial: ViewportInfo;
    coronal: ViewportInfo;
  };
  
  // Actions
  addStudy: (study: DicomStudy) => void;
  selectSeries: (orientation: 'sagittal' | 'axial' | 'coronal', series: DicomSeries) => void;
  updateViewportInfo: (orientation: 'sagittal' | 'axial' | 'coronal', info: Partial<ViewportInfo>) => void;
  clearStudies: () => void;
}

export const useDicomStore = create<DicomStore>((set) => ({
  studies: [],
  selectedSeries: {
    sagittal: null,
    axial: null,
    coronal: null,
  },
  viewportInfo: {
    sagittal: {
      orientation: 'sagittal',
      currentSlice: 0,
      totalSlices: 0,
      windowWidth: 400,
      windowLevel: 40,
      zoom: 1,
    },
    axial: {
      orientation: 'axial',
      currentSlice: 0,
      totalSlices: 0,
      windowWidth: 400,
      windowLevel: 40,
      zoom: 1,
    },
    coronal: {
      orientation: 'coronal',
      currentSlice: 0,
      totalSlices: 0,
      windowWidth: 400,
      windowLevel: 40,
      zoom: 1,
    },
  },

  addStudy: (study) =>
    set((state) => ({
      studies: [...state.studies, study],
    })),

  selectSeries: (orientation, series) =>
    set((state) => ({
      selectedSeries: {
        ...state.selectedSeries,
        [orientation]: series,
      },
    })),

  updateViewportInfo: (orientation, info) =>
    set((state) => ({
      viewportInfo: {
        ...state.viewportInfo,
        [orientation]: {
          ...state.viewportInfo[orientation],
          ...info,
        },
      },
    })),

  clearStudies: () =>
    set({
      studies: [],
      selectedSeries: {
        sagittal: null,
        axial: null,
        coronal: null,
      },
    }),
}));