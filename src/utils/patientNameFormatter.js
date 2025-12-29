// Helper function to parse DICOM patient name
// DICOM format: LastName^FirstName^MiddleName^Prefix^Suffix
export function formatPatientName(dicomName) {
  if (!dicomName) return 'Unknown Patient';
  
  // Remove any leading/trailing whitespace
  const cleaned = dicomName.trim();
  
  // Split by ^ delimiter
  const parts = cleaned.split('^').map(part => part.trim()).filter(part => part.length > 0);
  
  if (parts.length === 0) return 'Unknown Patient';
  
  // Format: "LastName, FirstName MiddleName"
  // [LastName] -> "LastName"
  // [LastName, FirstName] -> "LastName, FirstName"
  // [LastName, FirstName, MiddleName, ...] -> "LastName, FirstName MiddleName ..."
  
  if (parts.length === 1) {
    return parts[0]; // Just last name
  } else {
    // LastName, FirstName MiddleName ...
    const [lastName, firstName, ...rest] = parts;
    const restNames = rest.length > 0 ? ` ${rest.join(' ')}` : '';
    return `${lastName}, ${firstName}${restNames}`;
  }
}
