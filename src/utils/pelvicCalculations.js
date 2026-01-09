/**
 * Utility functions for calculating pelvic parameters
 * SS (Sacral Slope), PT (Pelvic Tilt), PI (Pelvic Incidence)
 */

/**
 * Calculate the angle between two points relative to horizontal
 * @param {Object} point1 - {x, y} in pixel coordinates
 * @param {Object} point2 - {x, y} in pixel coordinates
 * @returns {number} Angle in degrees
 */
export const calculateAngleToHorizontal = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  
  // atan2 gives angle from positive x-axis (horizontal right)
  // Note: In image coordinates, y increases downward
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  return angle;
};

/**
 * Calculate the angle between two points relative to vertical
 * @param {Object} point1 - Start point {x, y}
 * @param {Object} point2 - End point {x, y}
 * @returns {number} Angle in degrees (0° = straight up, positive = clockwise from vertical)
 */
export const calculateAngleToVertical = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  
  // Calculate angle from vertical (negative y-axis in image coordinates)
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  
  return angle;
};

/**
 * Calculate the perpendicular vector to a line
 * @param {Object} lineStart - {x, y}
 * @param {Object} lineEnd - {x, y}
 * @returns {Object} Normalized perpendicular vector {x, y}
 */
export const calculatePerpendicular = (lineStart, lineEnd) => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  
  // Perpendicular vector (rotate 90° counterclockwise)
  const perpX = -dy;
  const perpY = dx;
  
  // Normalize
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  
  return {
    x: perpX / length,
    y: perpY / length
  };
};

/**
 * Calculate the midpoint of a line
 * @param {Object} point1 - {x, y}
 * @param {Object} point2 - {x, y}
 * @returns {Object} Midpoint {x, y}
 */
export const calculateMidpoint = (point1, point2) => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
};

/**
 * Calculate the angle between two vectors
 * @param {Object} vector1 - {x, y}
 * @param {Object} vector2 - {x, y}
 * @returns {number} Angle in degrees (0-180)
 */
export const calculateAngleBetweenVectors = (vector1, vector2) => {
  // Dot product
  const dot = vector1.x * vector2.x + vector1.y * vector2.y;
  
  // Magnitudes
  const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  // Angle from dot product
  const cosAngle = dot / (mag1 * mag2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
  
  return angle;
};

/**
 * Calculate Sacral Slope (SS)
 * Angle between the sacral endplate and the horizontal
 * @param {Object} sacralLineStart - {x, y}
 * @param {Object} sacralLineEnd - {x, y}
 * @returns {number} SS angle in degrees
 */
export const calculateSacralSlope = (sacralLineStart, sacralLineEnd) => {
  const angle = calculateAngleToHorizontal(sacralLineStart, sacralLineEnd);
  
  // Return absolute value since we want the angle magnitude
  return Math.abs(angle);
};

/**
 * Calculate Pelvic Tilt (PT)
 * Angle between vertical and line from sacral midpoint to femoral head center
 * @param {Object} sacralMidpoint - {x, y}
 * @param {Object} femoralHead - {x, y}
 * @returns {number} PT angle in degrees
 */
export const calculatePelvicTilt = (sacralMidpoint, femoralHead) => {
  const angle = calculateAngleToVertical(sacralMidpoint, femoralHead);
  
  // Return absolute value
  return Math.abs(angle);
};

/**
 * Calculate Pelvic Incidence (PI)
 * Angle between perpendicular to sacral endplate and line to femoral head
 * @param {Object} sacralLineStart - {x, y}
 * @param {Object} sacralLineEnd - {x, y}
 * @param {Object} sacralMidpoint - {x, y}
 * @param {Object} femoralHead - {x, y}
 * @returns {number} PI angle in degrees
 */
export const calculatePelvicIncidence = (sacralLineStart, sacralLineEnd, sacralMidpoint, femoralHead) => {
  // Get perpendicular vector to sacral endplate
  const perp = calculatePerpendicular(sacralLineStart, sacralLineEnd);
  
  // Vector from sacral midpoint to femoral head
  const toFemoral = {
    x: femoralHead.x - sacralMidpoint.x,
    y: femoralHead.y - sacralMidpoint.y
  };
  
  // Calculate angle between perpendicular and line to femoral head
  const angle = calculateAngleBetweenVectors(perp, toFemoral);
  
  return angle;
};

/**
 * Calculate all pelvic parameters
 * @param {Object} handles - Tool handles containing all 4 points
 * @returns {Object} {ss, pt, pi, isValid}
 */
export const calculateAllPelvicParameters = (handles) => {
  const { femoralHead, sacralMidpoint, sacralLineStart, sacralLineEnd } = handles;
  
  // Validate all points exist
  if (!femoralHead || !sacralMidpoint || !sacralLineStart || !sacralLineEnd) {
    return null;
  }
  
  const ss = calculateSacralSlope(sacralLineStart, sacralLineEnd);
  const pt = calculatePelvicTilt(sacralMidpoint, femoralHead);
  const pi = calculatePelvicIncidence(sacralLineStart, sacralLineEnd, sacralMidpoint, femoralHead);
  
  // Validate the relationship: PI = PT + SS (within tolerance)
  const calculatedPI = pt + ss;
  const tolerance = 2; // degrees
  const isValid = Math.abs(pi - calculatedPI) <= tolerance;
  
  return {
    ss: ss.toFixed(1),
    pt: pt.toFixed(1),
    pi: pi.toFixed(1),
    isValid
  };
};