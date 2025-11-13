import Dexie from 'dexie';

const db = new Dexie('MRIVisualizerDB');

db.version(1).stores({
  files: '++id, name, type, sopInstanceUID, seriesInstanceUID, studyInstanceUID, imageId',
  series: 'seriesInstanceUID, studyInstanceUID, orientation, modality, seriesDescription, seriesNumber',
  studies: 'studyInstanceUID, patientName, patientID, studyDate, studyDescription',
  images: '++id, sopInstanceUID, imageData'
});

export default db;