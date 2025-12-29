import Dexie from 'dexie';

const db = new Dexie('DicomDB');

db.version(1).stores({
  files: '++id, name, type, sopInstanceUID, seriesInstanceUID, studyInstanceUID, imageId',
  series: 'seriesInstanceUID, studyInstanceUID, orientation, modality, seriesDescription, seriesNumber',
  studies: 'studyInstanceUID, patientName, patientID, studyDate, studyTime, studyDescription, patientBirthDate, patientSex',  // Added: patientSex
  images: '++id, sopInstanceUID, imageData'
});

export default db;