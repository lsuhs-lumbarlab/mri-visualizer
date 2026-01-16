/**
 * usePatientFilters Hook
 * 
 * Manages all patient filtering, sorting, and search functionality.
 * Encapsulates the complete patient list management logic including:
 * - Patient sorting (by name or date of birth)
 * - DOB year range filtering
 * - Search query filtering
 * - Filter application and clearing
 * 
 * @module hooks/usePatientFilters
 */

import { useState, useMemo, useCallback } from 'react';
import { filterPatientsByDobYear, validateYearInput } from '../utils/filterHelpers';
import { sortPatients } from '../utils/sortHelpers';

/**
 * Custom hook to manage patient filtering and sorting
 * @param {Array} patients - Array of patient objects
 * @param {string} searchQuery - Search query string
 * @returns {Object} Filtered patients and filter control functions
 */
export const usePatientFilters = (patients, searchQuery) => {
  // Sort state
  const [patientSort, setPatientSort] = useState({
    key: 'name', // 'name' | 'dob'
    direction: 'asc' // 'asc' | 'desc'
  });
  
  // Filter state
  const [patientFilters, setPatientFilters] = useState({
    dobYearFrom: null,
    dobYearTo: null,
  });
  
  // Temporary filter inputs (before Apply)
  const [tempDobFrom, setTempDobFrom] = useState('');
  const [tempDobTo, setTempDobTo] = useState('');
  
  // Filtered and sorted patients
  // Pipeline: filter by DOB → filter by search → sort
  const filteredPatients = useMemo(() => {
    // Step 1: Filter by DOB year range
    let filtered = filterPatientsByDobYear(patients, patientFilters);
    
    // Step 2: Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(patient => {
        const name = patient.name.toLowerCase();
        const patientId = patient.phiSummary.patientId.toLowerCase();
        const mrn = patient.metadata.mrn ? patient.metadata.mrn.toLowerCase() : '';
        
        return name.includes(query) || patientId.includes(query) || mrn.includes(query);
      });
    }
    
    // Step 3: Sort
    return sortPatients(filtered, patientSort);
  }, [patients, patientFilters, searchQuery, patientSort]);
  
  // DOB filter handlers - memoized to prevent unnecessary re-renders
  const handleDobFromChange = useCallback((e) => {
    const value = e.target.value;
    setTempDobFrom(value);
  }, []);
  
  const handleDobToChange = useCallback((e) => {
    const value = e.target.value;
    setTempDobTo(value);
  }, []);
  
  const handleDobFromBlur = useCallback(() => {
    const validated = validateYearInput(tempDobFrom);
    setTempDobFrom(validated);
  }, [tempDobFrom]);
  
  const handleDobToBlur = useCallback(() => {
    const validated = validateYearInput(tempDobTo);
    setTempDobTo(validated);
  }, [tempDobTo]);
  
  const handleApplyDobFilter = useCallback(() => {
    // Validate inputs first
    const validatedFrom = validateYearInput(tempDobFrom);
    const validatedTo = validateYearInput(tempDobTo);
    
    setTempDobFrom(validatedFrom);
    setTempDobTo(validatedTo);
    
    let fromYear = validatedFrom ? parseInt(validatedFrom) : null;
    let toYear = validatedTo ? parseInt(validatedTo) : null;
    
    // Auto-swap if from >= to
    if (fromYear !== null && toYear !== null && fromYear > toYear) {
      [fromYear, toYear] = [toYear, fromYear];
      setTempDobFrom(fromYear.toString());
      setTempDobTo(toYear.toString());
    }
    
    setPatientFilters({
      dobYearFrom: fromYear,
      dobYearTo: toYear,
    });
  }, [tempDobFrom, tempDobTo]);
  
  const handleClearDobFilter = useCallback(() => {
    setTempDobFrom('');
    setTempDobTo('');
    setPatientFilters({
      dobYearFrom: null,
      dobYearTo: null,
    });
  }, []);
  
  return {
    // Filtered data
    filteredPatients,
    
    // Sort state and controls
    patientSort,
    setPatientSort,
    
    // Filter state
    patientFilters,
    tempDobFrom,
    tempDobTo,
    
    // Filter handlers
    handleDobFromChange,
    handleDobToChange,
    handleDobFromBlur,
    handleDobToBlur,
    handleApplyDobFilter,
    handleClearDobFilter,
  };
};
