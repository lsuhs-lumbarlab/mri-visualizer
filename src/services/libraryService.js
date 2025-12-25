// Mock service for DICOM Library
// This will be replaced with real API calls later

// Store uploaded patients in memory (simulates database)
let uploadedPatients = [];

// Mock patient data
const mockPatients = [
  {
    id: 'patient-1',
    name: 'John Doe',
    dob: '1975-03-15',
    phiSummary: {
      patientId: 'MRN-001234',
      sex: 'M',
      age: 49,
    },
    metadata: {
      address: '123 Main St, City, State',
      phone: '555-0100',
      email: 'john.doe@example.com',
    },
    studies: [
      {
        id: 'study-1',
        description: 'Lumbar Spine MRI',
        date: '2024-01-15',
        modality: 'MR',
        metadata: {
          studyInstanceUID: '1.2.840.113619.2.1.1.1',
          accessionNumber: 'ACC-001',
          referringPhysician: 'Dr. Smith',
        },
      },
      {
        id: 'study-2',
        description: 'Follow-up Lumbar Spine',
        date: '2024-03-10',
        modality: 'MR',
        metadata: {
          studyInstanceUID: '1.2.840.113619.2.1.1.2',
          accessionNumber: 'ACC-002',
          referringPhysician: 'Dr. Smith',
        },
      },
    ],
  },
  {
    id: 'patient-2',
    name: 'Jane Smith',
    dob: '1982-07-22',
    phiSummary: {
      patientId: 'MRN-002345',
      sex: 'F',
      age: 42,
    },
    metadata: {
      address: '456 Oak Ave, City, State',
      phone: '555-0200',
      email: 'jane.smith@example.com',
    },
    studies: [
      {
        id: 'study-3',
        description: 'Cervical Spine MRI',
        date: '2024-02-20',
        modality: 'MR',
        metadata: {
          studyInstanceUID: '1.2.840.113619.2.1.2.1',
          accessionNumber: 'ACC-003',
          referringPhysician: 'Dr. Jones',
        },
      },
    ],
  },
  {
    id: 'patient-3',
    name: 'Robert Johnson',
    dob: '1968-11-30',
    phiSummary: {
      patientId: 'MRN-003456',
      sex: 'M',
      age: 56,
    },
    metadata: {
      address: '789 Pine Rd, City, State',
      phone: '555-0300',
      email: 'robert.j@example.com',
    },
    studies: [
      {
        id: 'study-4',
        description: 'Thoracic Spine MRI',
        date: '2024-01-05',
        modality: 'MR',
        metadata: {
          studyInstanceUID: '1.2.840.113619.2.1.3.1',
          accessionNumber: 'ACC-004',
          referringPhysician: 'Dr. Williams',
        },
      },
      {
        id: 'study-5',
        description: 'Brain MRI',
        date: '2024-02-15',
        modality: 'MR',
        metadata: {
          studyInstanceUID: '1.2.840.113619.2.1.3.2',
          accessionNumber: 'ACC-005',
          referringPhysician: 'Dr. Brown',
        },
      },
    ],
  },
];

// Generate a new mock patient from uploaded files
const generateMockPatient = (fileCount) => {
  const patientNumber = uploadedPatients.length + 4; // Start after existing 3 patients
  const currentDate = new Date();
  
  // Random names for variety
  const firstNames = ['Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa', 'Christopher', 'Jessica'];
  const lastNames = ['Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Random age between 30-70
  const age = 30 + Math.floor(Math.random() * 40);
  const birthYear = currentDate.getFullYear() - age;
  
  // Random sex
  const sex = Math.random() > 0.5 ? 'M' : 'F';
  
  const newPatient = {
    id: `patient-${patientNumber}`,
    name: `${firstName} ${lastName}`,
    dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    phiSummary: {
      patientId: `MRN-${String(patientNumber).padStart(6, '0')}`,
      sex: sex,
      age: age,
    },
    metadata: {
      address: `${Math.floor(Math.random() * 9999)} ${['Main', 'Oak', 'Maple', 'Pine'][Math.floor(Math.random() * 4)]} St, City, State`,
      phone: `555-0${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    },
    studies: [
      {
        id: `study-upload-${patientNumber}`,
        description: 'Uploaded Study - Lumbar Spine MRI',
        date: currentDate.toISOString().split('T')[0],
        modality: 'MR',
        metadata: {
          studyInstanceUID: `1.2.840.113619.2.${patientNumber}.1.1`,
          accessionNumber: `ACC-UP${String(patientNumber).padStart(3, '0')}`,
          referringPhysician: 'Dr. Upload',
        },
      },
    ],
  };
  
  return newPatient;
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const libraryService = {
  // Get all patients accessible to the user
  async listAccessiblePatients() {
    await delay(500); // Simulate network delay
    
    // Return base mock patients + any uploaded patients
    return {
      success: true,
      data: [...mockPatients, ...uploadedPatients],
    };
  },

  // Upload DICOM folder (placeholder with mock patient generation)
  async uploadDicomFolder(files) {
    await delay(2000); // Simulate 2 second upload
    console.log('Upload placeholder called with files:', files);
    
    // Generate a new mock patient
    const newPatient = generateMockPatient(files.length);
    uploadedPatients.push(newPatient);
    
    return {
      success: true,
      message: `Successfully uploaded ${files.length} DICOM file(s)`,
      patient: newPatient,
    };
  },

  // Share patient (placeholder)
  async sharePatient(patientId, targetEmail) {
    await delay(500);
    console.log(`Share patient ${patientId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Patient shared successfully',
    };
  },

  // Share study (placeholder)
  async shareStudy(studyId, targetEmail) {
    await delay(500);
    console.log(`Share study ${studyId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Study shared successfully',
    };
  },
};

export default libraryService;