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
