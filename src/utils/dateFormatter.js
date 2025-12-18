/**
 * Format DICOM date (YYYYMMDD) to "Mmm dd, yyyy"
 * @param {string} dicomDate - Date in DICOM format (YYYYMMDD)
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
export const formatDicomDate = (dicomDate) => {
  if (!dicomDate || dicomDate === 'Unknown') return 'Unknown';
  
  // DICOM date format is YYYYMMDD
  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);
  
  // Create date object
  const date = new Date(year, parseInt(month) - 1, day);
  
  // Check if valid date
  if (isNaN(date.getTime())) return 'Unknown';
  
  // Format as "Mmm dd, yyyy"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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