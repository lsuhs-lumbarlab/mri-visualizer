import Dexie from 'dexie';

const db = new Dexie('DicomDB');

db.version(1).stores({
  files: '++id, name, type, sopInstanceUID, seriesInstanceUID, studyInstanceUID, imageId',
  series: 'seriesInstanceUID, studyInstanceUID, orientation, modality, seriesDescription, seriesNumber, seriesDate, seriesTime',
  studies: 'studyInstanceUID, patientID, studyDate, studyTime, studyDescription',
  patients: 'patientID, patientName, patientBirthDate, patientSex',
  images: '++id, sopInstanceUID, imageData'
});

export default db;