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

/**
 * Parse formatted study date to YYYYMMDD number for comparison
 * @param {string} dateStr - Formatted date (e.g., "Jan 15, 2026")
 * @returns {number|null} YYYYMMDD as number, or null if invalid
 */
const parseStudyDateToNumber = (dateStr) => {
  if (!dateStr || dateStr === 'Unknown') return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return parseInt(`${year}${month}${day}`);
  } catch (e) {
    return null;
  }
};

/**
 * Filter studies by date range
 * @param {Array} studies - Array of study objects
 * @param {Object} filters - { dateFromMonth: number|null, dateFromYear: number|null, dateToMonth: number|null, dateToYear: number|null }
 * @returns {Array} Filtered studies
 */
export const filterStudiesByDateRange = (studies, filters) => {
  if (!studies || studies.length === 0) return [];
  
  const { dateFromMonth, dateFromYear, dateToMonth, dateToYear } = filters;
  
  // If no filters applied, return all
  const hasFromDate = dateFromMonth !== null && dateFromYear !== null;
  const hasToDate = dateToMonth !== null && dateToYear !== null;
  
  if (!hasFromDate && !hasToDate) {
    return studies;
  }
  
  // Build from/to dates as YYYYMMDD numbers
  let fromDate = null;
  let toDate = null;
  
  if (hasFromDate) {
    // First day of from month/year
    fromDate = parseInt(`${dateFromYear}${String(dateFromMonth).padStart(2, '0')}01`);
  }
  
  if (hasToDate) {
    // Last day of to month/year
    const lastDay = new Date(dateToYear, dateToMonth, 0).getDate();
    toDate = parseInt(`${dateToYear}${String(dateToMonth).padStart(2, '0')}${String(lastDay).padStart(2, '0')}`);
  }
  
  return studies.filter(study => {
    const studyDate = parseStudyDateToNumber(study.date);
    
    // If study date is invalid, exclude it
    if (studyDate === null) return false;
    
    // Check from date
    if (fromDate !== null && studyDate < fromDate) {
      return false;
    }
    
    // Check to date
    if (toDate !== null && studyDate > toDate) {
      return false;
    }
    
    return true;
  });
};

/**
 * Filter studies by selected modalities
 * @param {Array} studies - Array of study objects
 * @param {Array} selectedModalities - Array of selected modality strings (e.g., ['MR', 'CT'])
 * @returns {Array} Filtered studies
 */
export const filterStudiesByModality = (studies, selectedModalities) => {
  if (!studies || studies.length === 0) return [];
  
  // If no modalities selected or selectedModalities is empty, return empty array
  if (!selectedModalities || selectedModalities.length === 0) {
    return [];
  }
  
  return studies.filter(study => {
    if (!study.modality) return false;
    return selectedModalities.includes(study.modality);
  });
};
