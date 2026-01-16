/**
 * Utility functions for sorting patients and studies
 * All comparators are null-safe and handle missing/invalid data
 */

/**
 * Parse formatted DOB string to a comparable Date object
 * @param {string} dob - Formatted DOB (e.g., "Jan 15, 1980" or "Unknown")
 * @returns {Date|null} Date object or null if invalid
 */
const parseDobToDate = (dob) => {
  if (!dob || dob === 'Unknown') return null;
  
  try {
    // Parse "Mmm DD, YYYY" format
    const date = new Date(dob);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
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
    
    // Tie-breaker 1: DOB (parse to Date for proper comparison)
    const dobDateA = parseDobToDate(a.dob);
    const dobDateB = parseDobToDate(b.dob);
    
    if (dobDateA && dobDateB) {
      const comparison = dobDateA.getTime() - dobDateB.getTime();
      if (comparison !== 0) return comparison < 0 ? -1 : 1;
    } else if (dobDateA) {
      return -1; // A has valid date, B doesn't
    } else if (dobDateB) {
      return 1; // B has valid date, A doesn't
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
    const dobDateA = parseDobToDate(a.dob);
    const dobDateB = parseDobToDate(b.dob);
    
    // Handle missing/invalid DOB - always push to bottom
    if (!dobDateA && !dobDateB) {
      // Both invalid, sort by name
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return compareValues(nameA, nameB, 'asc');
    }
    
    if (!dobDateA) return 1; // A is invalid, push to bottom
    if (!dobDateB) return -1; // B is invalid, push to bottom
    
    // Both valid - compare DOB chronologically
    const comparison = dobDateA.getTime() - dobDateB.getTime();
    if (comparison !== 0) {
      return direction === 'asc' ? comparison : -comparison;
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
 * Parse formatted study date back to DICOM format for sorting
 * Study date is stored as formatted "Mmm DD, YYYY" but we need YYYYMMDD for comparison
 * @param {string} formattedDate - Formatted date string
 * @returns {number} Comparable number (0 if invalid)
 */
const parseFormattedStudyDate = (formattedDate) => {
  if (!formattedDate || formattedDate === 'Unknown') return 0;
  
  try {
    const date = new Date(formattedDate);
    if (isNaN(date.getTime())) return 0;
    
    // Convert to YYYYMMDD format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return parseInt(`${year}${month}${day}`);
  } catch {
    return 0;
  }
};

/**
 * Sort studies by date with tie-breakers
 * Tie-breakers: studyDate → studyTime → description → accessionNumber → studyId
 * Missing dates always go to bottom regardless of direction
 * @param {Array} studies - Array of study objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortStudiesByDate = (studies, direction = 'desc') => {
  return [...studies].sort((a, b) => {
    // Parse study dates (formatted as "Mmm DD, YYYY")
    const dateA = parseFormattedStudyDate(a.date);
    const dateB = parseFormattedStudyDate(b.date);
    
    // Handle missing/invalid dates - always push to bottom
    if (!dateA && !dateB) {
      // Both invalid, sort by description
      const descA = (a.description || '').toLowerCase();
      const descB = (b.description || '').toLowerCase();
      return compareValues(descA, descB, 'asc');
    }
    
    if (!dateA) return 1; // A is invalid, push to bottom
    if (!dateB) return -1; // B is invalid, push to bottom
    
    // Both valid - compare dates
    if (dateA !== dateB) {
      return compareValues(dateA, dateB, direction);
    }
    
    // Tie-breaker 1: studyTime
    // Parse formatted time "HH:MM:SS" back to comparable number
    const timeA = a.time && a.time !== 'Unknown' ? a.time.replace(/:/g, '') : '';
    const timeB = b.time && b.time !== 'Unknown' ? b.time.replace(/:/g, '') : '';
    
    if (timeA && timeB && timeA !== timeB) {
      return compareValues(parseInt(timeA), parseInt(timeB), direction);
    }
    
    // Tie-breaker 2: description
    const descA = (a.description || '').toLowerCase();
    const descB = (b.description || '').toLowerCase();
    
    if (descA !== descB) {
      return compareValues(descA, descB, 'asc');
    }
    
    // Tie-breaker 3: accessionNumber
    const accA = a.metadata?.accessionNumber || '';
    const accB = b.metadata?.accessionNumber || '';
    
    if (accA !== accB) {
      return compareValues(accA, accB, 'asc');
    }
    
    // Tie-breaker 4: studyId
    const idA = a.metadata?.studyID || '';
    const idB = b.metadata?.studyID || '';
    
    return compareValues(idA, idB, 'asc');
  });
};

/**
 * Sort studies by description with tie-breakers
 * Tie-breakers: description → studyDate → studyTime → accessionNumber → studyId
 * @param {Array} studies - Array of study objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortStudiesByDescription = (studies, direction = 'asc') => {
  return [...studies].sort((a, b) => {
    // Primary: description (case-insensitive)
    const descA = (a.description || '').toLowerCase();
    const descB = (b.description || '').toLowerCase();
    
    if (descA !== descB) {
      return compareValues(descA, descB, direction);
    }
    
    // Tie-breaker 1: studyDate
    const dateA = parseFormattedStudyDate(a.date);
    const dateB = parseFormattedStudyDate(b.date);
    
    if (dateA && dateB && dateA !== dateB) {
      return compareValues(dateA, dateB, 'desc'); // Newer first
    } else if (dateA) {
      return -1;
    } else if (dateB) {
      return 1;
    }
    
    // Tie-breaker 2: studyTime
    const timeA = a.time && a.time !== 'Unknown' ? a.time.replace(/:/g, '') : '';
    const timeB = b.time && b.time !== 'Unknown' ? b.time.replace(/:/g, '') : '';
    
    if (timeA && timeB && timeA !== timeB) {
      return compareValues(parseInt(timeA), parseInt(timeB), 'desc');
    }
    
    // Tie-breaker 3: accessionNumber
    const accA = a.metadata?.accessionNumber || '';
    const accB = b.metadata?.accessionNumber || '';
    
    if (accA !== accB) {
      return compareValues(accA, accB, 'asc');
    }
    
    // Tie-breaker 4: studyId
    const idA = a.metadata?.studyID || '';
    const idB = b.metadata?.studyID || '';
    
    return compareValues(idA, idB, 'asc');
  });
};

/**
 * Main study sorting function
 * @param {Array} studies - Array of study objects
 * @param {Object} sortConfig - { key: 'date' | 'description', direction: 'asc' | 'desc' }
 * @returns {Array} Sorted array (new array, does not mutate)
 */
export const sortStudies = (studies, sortConfig) => {
  if (!studies || studies.length === 0) return studies;
  
  const { key, direction } = sortConfig;
  
  switch (key) {
    case 'date':
      return sortStudiesByDate(studies, direction);
    case 'description':
      return sortStudiesByDescription(studies, direction);
    default:
      return studies;
  }
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
