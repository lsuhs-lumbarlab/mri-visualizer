/**
 * Utility functions for filtering patients and studies
 * All filters are null-safe and handle missing/invalid data
 */

/**
 * Validate and clamp year input to valid range (1900 to current year)
 * @param {string} value - Year input value
 * @returns {string} Validated year string, or empty string if invalid
 */
export const validateYearInput = (value) => {
  if (!value) return '';
  
  const year = parseInt(value);
  if (isNaN(year)) return '';
  
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  
  // Clamp to valid range
  if (year < minYear) return minYear.toString();
  if (year > currentYear) return currentYear.toString();
  
  return year.toString();
};

/**
 * Extract year from formatted DOB string
 * @param {string} dob - Formatted DOB (e.g., "Jan 15, 1980" or "Unknown")
 * @returns {number|null} Year as number, or null if invalid
 */
const extractYearFromDob = (dob) => {
  if (!dob || dob === 'Unknown') return null;
  
  // DOB format is "Mmm DD, YYYY"
  const parts = dob.split(',');
  if (parts.length < 2) return null;
  
  const yearStr = parts[1].trim();
  const year = parseInt(yearStr);
  
  if (isNaN(year)) return null;
  
  return year;
};

/**
 * Filter patients by DOB year range
 * @param {Array} patients - Array of patient objects
 * @param {Object} filters - { dobYearFrom: number|null, dobYearTo: number|null }
 * @returns {Array} Filtered array (new array, does not mutate)
 */
export const filterPatientsByDobYear = (patients, filters) => {
  if (!patients || patients.length === 0) return patients;
  
  const { dobYearFrom, dobYearTo } = filters;
  
  // No filter active
  if (dobYearFrom === null && dobYearTo === null) {
    return patients;
  }
  
  return patients.filter(patient => {
    const year = extractYearFromDob(patient.dob);
    
    // If year is invalid/missing, exclude from filtered results
    if (year === null) return false;
    
    // Check range (inclusive)
    const fromCheck = dobYearFrom === null || year >= dobYearFrom;
    const toCheck = dobYearTo === null || year <= dobYearTo;
    
    return fromCheck && toCheck;
  });
};
