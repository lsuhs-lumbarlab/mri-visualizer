/**
 * Utility functions for sorting patients and studies
 * All comparators are null-safe and handle missing/invalid data
 */

/**
 * Parse DICOM date (YYYYMMDD) to a comparable number
 * @param {string} dicomDate - Date in DICOM format or formatted display string
 * @returns {number} Comparable number (0 if invalid)
 */
const parseDicomDate = (dicomDate) => {
  if (!dicomDate || dicomDate === 'Unknown') return 0;
  
  // Try to parse as YYYYMMDD
  if (typeof dicomDate === 'string' && /^\d{8}$/.test(dicomDate)) {
    return parseInt(dicomDate);
  }
  
  return 0;
};

/**
 * Compare two values for sorting
 * @param {any} a - First value
 * @param {any} b - Second value
 * @param {string} direction - 'asc' or 'desc'
 * @returns {number} -1, 0, or 1
 */
const compareValues = (a, b, direction = 'asc') => {
  if (a === b) return 0;
  
  const result = a < b ? -1 : 1;
  return direction === 'asc' ? result : -result;
};

/**
 * Sort patients by name with tie-breakers
 * Tie-breakers: name → dob → patientId
 * @param {Array} patients - Array of patient objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortPatientsByName = (patients, direction = 'asc') => {
  return [...patients].sort((a, b) => {
    // Primary: name (case-insensitive)
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    
    if (nameA !== nameB) {
      return compareValues(nameA, nameB, direction);
    }
    
    // Tie-breaker 1: DOB (raw DICOM date from phiSummary)
    // Note: We'll need to add rawDob to patient object or extract from formatted dob
    // For now, compare formatted dob strings
    const dobA = a.dob || '';
    const dobB = b.dob || '';
    
    if (dobA !== dobB) {
      return compareValues(dobA, dobB, 'asc'); // Fixed order for tie-breaker
    }
    
    // Tie-breaker 2: patientId
    const idA = a.phiSummary?.patientId || '';
    const idB = b.phiSummary?.patientId || '';
    
    return compareValues(idA, idB, 'asc'); // Fixed order for tie-breaker
  });
};

/**
 * Sort patients by date of birth with tie-breakers
 * Missing/invalid DOB always goes to bottom regardless of direction
 * Tie-breakers: dob → name → patientId
 * @param {Array} patients - Array of patient objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortPatientsByDob = (patients, direction = 'asc') => {
  return [...patients].sort((a, b) => {
    const dobA = a.dob || '';
    const dobB = b.dob || '';
    
    // Handle missing/invalid DOB - always push to bottom
    const isValidA = dobA && dobA !== 'Unknown';
    const isValidB = dobB && dobB !== 'Unknown';
    
    if (!isValidA && !isValidB) {
      // Both invalid, sort by name
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return compareValues(nameA, nameB, 'asc');
    }
    
    if (!isValidA) return 1; // A is invalid, push to bottom
    if (!isValidB) return -1; // B is invalid, push to bottom
    
    // Both valid - compare DOB
    // Note: DOB is formatted as "Mmm DD, YYYY" - we need to parse it
    // For better sorting, we should use raw DICOM date, but for now use string comparison
    if (dobA !== dobB) {
      return compareValues(dobA, dobB, direction);
    }
    
    // Tie-breaker 1: name
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    
    if (nameA !== nameB) {
      return compareValues(nameA, nameB, 'asc'); // Fixed order for tie-breaker
    }
    
    // Tie-breaker 2: patientId
    const idA = a.phiSummary?.patientId || '';
    const idB = b.phiSummary?.patientId || '';
    
    return compareValues(idA, idB, 'asc'); // Fixed order for tie-breaker
  });
};

/**
 * Main patient sorting function
 * @param {Array} patients - Array of patient objects
 * @param {Object} sortConfig - { key: 'name' | 'dob', direction: 'asc' | 'desc' }
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortPatients = (patients, sortConfig) => {
  if (!patients || patients.length === 0) return patients;
  
  const { key, direction } = sortConfig;
  
  switch (key) {
    case 'name':
      return sortPatientsByName(patients, direction);
    case 'dob':
      return sortPatientsByDob(patients, direction);
    default:
      return patients;
  }
};
