// Mock service for DICOM Library
// This will be replaced with real API calls later

// Mock patient data
// const mockPatients = [];
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

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const libraryService = {
  // Get all patients accessible to the user
  async listAccessiblePatients() {
    await delay(500); // Simulate network delay
    return {
      success: true,
      data: mockPatients,
    };
  },

  // Upload DICOM folder (placeholder)
  async uploadDicomFolder(files) {
    await delay(1000);
    console.log('Upload placeholder called with files:', files);
    return {
      success: true,
      message: 'Upload functionality will be implemented in Step 6',
    };
  },

  // Share patient (placeholder)
  async sharePatient(patientId, targetEmail) {
    await delay(500);
    console.log(`Share patient ${patientId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Share functionality will be implemented in Step 5',
    };
  },

  // Share study (placeholder)
  async shareStudy(studyId, targetEmail) {
    await delay(500);
    console.log(`Share study ${studyId} with ${targetEmail}`);
    return {
      success: true,
      message: 'Share functionality will be implemented in Step 5',
    };
  },
};

export default libraryService;