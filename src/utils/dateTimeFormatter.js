/**
 * Format DICOM date (YYYYMMDD) to "Mmm dd, yyyy"
 * @param {string} dicomDate - Date in DICOM format (YYYYMMDD)
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
export const formatDicomDate = (dicomDate) => {
  if (!dicomDate || dicomDate === 'Unknown') return 'Unknown';
  
  // DICOM date format is YYYYMMDD
  if (dicomDate.length < 8) return 'Unknown';
  
  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);
  
  // Validate the extracted values
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return 'Unknown';
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return 'Unknown';
  
  // Format as "Mmm dd, yyyy" without using Date object to avoid timezone issues
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${monthNames[monthNum - 1]} ${dayNum}, ${yearNum}`;
};

/**
 * Format DICOM time (HHMMSS.FFFFFF) to "HH:MM:SS"
 * @param {string} dicomTime - Time in DICOM format (HHMMSS or HHMMSS.FFFFFF)
 * @returns {string} Formatted time (e.g., "14:35:22")
 */
export const formatDicomTime = (dicomTime) => {
  if (!dicomTime || dicomTime === 'Unknown') return 'Unknown';
  
  // DICOM time format is HHMMSS.FFFFFF (fractional seconds are optional)
  // Extract HH, MM, SS
  const hours = dicomTime.substring(0, 2);
  const minutes = dicomTime.substring(2, 4);
  const seconds = dicomTime.substring(4, 6);
  
  // Validate
  if (!hours || !minutes || !seconds) return 'Unknown';
  
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Calculate age from DICOM birth date (YYYYMMDD)
 * @param {string} birthDate - Birth date in DICOM format (YYYYMMDD)
 * @returns {number|null} Age in years, or null if invalid
 */
export const calculateAge = (birthDate) => {
  if (!birthDate || birthDate.length < 8) return null;
  
  try {
    // DICOM date format is YYYYMMDD
    const year = parseInt(birthDate.substring(0, 4));
    const month = parseInt(birthDate.substring(4, 6));
    const day = parseInt(birthDate.substring(6, 8));
    
    // Validate numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    const birth = new Date(year, month - 1, day);
    
    // Check if valid date
    if (isNaN(birth.getTime())) return null;
    
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Return null if age is invalid (negative or > 150)
    if (age < 0 || age > 150) return null;
    
    return age;
  } catch (error) {
    return null;
  }
};