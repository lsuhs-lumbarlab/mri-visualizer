import { useState, useMemo, useEffect, useCallback } from 'react';
import { filterStudiesByDateRange, filterStudiesByModality } from '../utils/filterHelpers';
import { sortStudies } from '../utils/sortHelpers';

/**
 * Custom hook to manage study filtering and sorting
 * @param {Object} selectedPatient - Currently selected patient object
 * @param {string} searchQuery - Search query string
 * @returns {Object} Filtered studies and filter control functions
 */
export const useStudyFilters = (selectedPatient, searchQuery) => {
  // Sort state
  const [studySort, setStudySort] = useState({
    key: 'date', // 'date' | 'description'
    direction: 'desc' // 'asc' | 'desc' (default newest first)
  });
  
  // Filter states
  const [studyFilters, setStudyFilters] = useState({
    dateFromMonth: null,
    dateFromYear: null,
    dateToMonth: null,
    dateToYear: null,
  });
  
  const [selectedModalities, setSelectedModalities] = useState([]);
  const [modalityAnchorEl, setModalityAnchorEl] = useState(null);
  
  // Temporary filter inputs (before Apply)
  const [tempDateFromMonth, setTempDateFromMonth] = useState('');
  const [tempDateFromYear, setTempDateFromYear] = useState('');
  const [tempDateToMonth, setTempDateToMonth] = useState('');
  const [tempDateToYear, setTempDateToYear] = useState('');
  
  // Clear study search and filters when selected patient changes
  useEffect(() => {
    // Clear study date filter when switching patients
    setTempDateFromMonth('');
    setTempDateFromYear('');
    setTempDateToMonth('');
    setTempDateToYear('');
    setStudyFilters({
      dateFromMonth: null,
      dateFromYear: null,
      dateToMonth: null,
      dateToYear: null,
    });
    // Modality filter will auto-reset via availableModalities useEffect
  }, [selectedPatient]);
  
  // Get available years from selected patient's studies
  const availableYears = useMemo(() => {
    if (!selectedPatient || selectedPatient.studies.length === 0) return [];
    
    const years = new Set();
    selectedPatient.studies.forEach(study => {
      if (study.date && study.date !== 'Unknown') {
        try {
          const date = new Date(study.date);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
    
    return Array.from(years).sort((a, b) => b - a); // Newest first
  }, [selectedPatient]);
  
  // Get available modalities with counts from selected patient's studies
  const availableModalities = useMemo(() => {
    if (!selectedPatient || selectedPatient.studies.length === 0) return [];
    
    const modalityCounts = {};
    selectedPatient.studies.forEach(study => {
      if (study.modality) {
        modalityCounts[study.modality] = (modalityCounts[study.modality] || 0) + 1;
      }
    });
    
    return Object.entries(modalityCounts)
      .map(([modality, count]) => ({ modality, count }))
      .sort((a, b) => a.modality.localeCompare(b.modality)); // Alphabetical
  }, [selectedPatient]);
  
  // Compute modality filter label
  const modalityFilterLabel = useMemo(() => {
    if (selectedModalities.length === 0) return 'Modality:';
    if (selectedModalities.length === availableModalities.length) return 'Modality: All';
    
    // Sort selected modalities alphabetically for consistent display
    const sorted = [...selectedModalities].sort();
    
    if (sorted.length === 1) {
      return `Modality: ${sorted[0]}`;
    } else if (sorted.length <= 3) {
      return `Modality: ${sorted.join(', ')}`;
    } else {
      const first = sorted.slice(0, 2).join(', ');
      const remaining = sorted.length - 2;
      return `Modality: ${first} +${remaining}`;
    }
  }, [selectedModalities, availableModalities]);
  
  // Initialize selectedModalities when patient changes or availableModalities change
  useEffect(() => {
    if (availableModalities.length > 0) {
      setSelectedModalities(availableModalities.map(m => m.modality));
    } else {
      setSelectedModalities([]);
    }
  }, [availableModalities]);
  
  // Filtered and sorted studies
  // Pipeline: filter by date range → filter by modality → filter by search → sort
  const filteredStudies = useMemo(() => {
    if (!selectedPatient) return [];
    
    // Step 1: Filter by date range
    let filtered = filterStudiesByDateRange(selectedPatient.studies, studyFilters);
    
    // Step 2: Filter by modality
    filtered = filterStudiesByModality(filtered, selectedModalities);
    
    // Step 3: Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(study => {
        const description = study.description.toLowerCase();
        const modality = study.modality.toLowerCase();
        const studyId = study.metadata.studyID ? study.metadata.studyID.toLowerCase() : '';
        const accessionNumber = study.metadata.accessionNumber ? study.metadata.accessionNumber.toLowerCase() : '';
        
        return description.includes(query) || modality.includes(query) || studyId.includes(query) || accessionNumber.includes(query);
      });
    }
    
    // Step 4: Sort
    return sortStudies(filtered, studySort);
  }, [selectedPatient, studyFilters, selectedModalities, searchQuery, studySort]);
  
  // Study date filter handlers - memoized to prevent unnecessary re-renders
  const handleApplyStudyDateFilter = useCallback(() => {
    const fromMonth = tempDateFromMonth ? parseInt(tempDateFromMonth) : null;
    const fromYear = tempDateFromYear ? parseInt(tempDateFromYear) : null;
    const toMonth = tempDateToMonth ? parseInt(tempDateToMonth) : null;
    const toYear = tempDateToYear ? parseInt(tempDateToYear) : null;
    
    // Build comparable dates (YYYYMM format for easy comparison)
    let from = null;
    let to = null;
    
    if (fromMonth !== null && fromYear !== null) {
      from = fromYear * 100 + fromMonth;
    }
    
    if (toMonth !== null && toYear !== null) {
      to = toYear * 100 + toMonth;
    }
    
    // Auto-swap if from > to
    if (from !== null && to !== null && from > to) {
      setTempDateFromMonth(toMonth.toString());
      setTempDateFromYear(toYear.toString());
      setTempDateToMonth(fromMonth.toString());
      setTempDateToYear(fromYear.toString());
      
      setStudyFilters({
        dateFromMonth: toMonth,
        dateFromYear: toYear,
        dateToMonth: fromMonth,
        dateToYear: fromYear,
      });
    } else {
      setStudyFilters({
        dateFromMonth: fromMonth,
        dateFromYear: fromYear,
        dateToMonth: toMonth,
        dateToYear: toYear,
      });
    }
  }, [tempDateFromMonth, tempDateFromYear, tempDateToMonth, tempDateToYear]);
  
  const handleClearStudyDateFilter = useCallback(() => {
    setTempDateFromMonth('');
    setTempDateFromYear('');
    setTempDateToMonth('');
    setTempDateToYear('');
    setStudyFilters({
      dateFromMonth: null,
      dateFromYear: null,
      dateToMonth: null,
      dateToYear: null,
    });
  }, []);
  
  // Modality filter handlers - memoized to prevent unnecessary re-renders
  const handleModalityClick = useCallback((event) => {
    setModalityAnchorEl(event.currentTarget);
  }, []);
  
  const handleModalityClose = useCallback(() => {
    setModalityAnchorEl(null);
  }, []);
  
  const handleModalityToggle = useCallback((modality) => {
    setSelectedModalities(prev => {
      // If trying to uncheck and it's the last one selected, ignore
      if (prev.includes(modality) && prev.length === 1) {
        return prev; // Keep it checked
      }
      
      if (prev.includes(modality)) {
        return prev.filter(m => m !== modality);
      } else {
        return [...prev, modality];
      }
    });
  }, []);
  
  const handleSelectAllModalities = useCallback(() => {
    setSelectedModalities(availableModalities.map(m => m.modality));
  }, [availableModalities]);
  
  const modalityPopoverOpen = useMemo(() => Boolean(modalityAnchorEl), [modalityAnchorEl]);
  
  return {
    // Filtered data
    filteredStudies,
    
    // Sort state and controls
    studySort,
    setStudySort,
    
    // Date filter state
    studyFilters,
    tempDateFromMonth,
    tempDateFromYear,
    tempDateToMonth,
    tempDateToYear,
    availableYears,
    
    // Date filter handlers
    setTempDateFromMonth,
    setTempDateFromYear,
    setTempDateToMonth,
    setTempDateToYear,
    handleApplyStudyDateFilter,
    handleClearStudyDateFilter,
    
    // Modality filter state
    selectedModalities,
    modalityAnchorEl,
    modalityPopoverOpen,
    availableModalities,
    modalityFilterLabel,
    
    // Modality filter handlers
    handleModalityClick,
    handleModalityClose,
    handleModalityToggle,
    handleSelectAllModalities,
  };
};
