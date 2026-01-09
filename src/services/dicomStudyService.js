import apiClient from './apiClient';

/**
 * Service for backend DICOM study operations
 * Uses authenticated apiClient which automatically attaches JWT tokens
 */
const dicomStudyService = {
  /**
   * Step 1: Initiate upload - get presigned S3 URLs
   * @param {Array} files - Array of {filename, size, content_type}
   * @returns {Promise<{study_id, upload_urls, storage_path, expires_at}>}
   */
  async initiateUpload(files) {
    try {
      const response = await apiClient.post('/studies/upload/initiate', {
        files: files.map(file => ({
          filename: file.name || file.filename,
          size: file.size,
          content_type: file.type || 'application/dicom'
        }))
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Upload initiation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to initiate upload'
      };
    }
  },

  /**
   * Step 2: Upload file to S3 using presigned URL
   * @param {string} uploadUrl - Presigned S3 URL
   * @param {File} file - File object to upload
   * @param {Function} onProgress - Progress callback (percentage)
   * @returns {Promise<{success: boolean}>}
   */
  async uploadFileToS3(uploadUrl, file, onProgress = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve({ success: true });
        } else {
          reject(new Error(`S3 upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('S3 upload network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('S3 upload aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/dicom');
      xhr.send(file);
    });
  },

  /**
   * Step 3: Complete upload - trigger backend processing
   * @param {string} studyId - Study ID from initiate response
   * @returns {Promise<{study_id, task_id, status}>}
   */
  async completeUpload(studyId) {
    try {
      const response = await apiClient.post('/studies/upload/complete', {
        study_id: studyId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Upload completion failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to complete upload'
      };
    }
  },

  /**
   * List all studies (fetch all pages)
   * @returns {Promise<Array>} All studies
   */
  async listAllStudies() {
    try {
      const allStudies = [];
      let page = 1;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient.get('/studies', {
          params: { 
            page: page,
            page_size: pageSize 
          }
        });

        const { studies = [], total = 0 } = response.data;

        if (studies.length > 0) {
          allStudies.push(...studies);
        }
        
        // Check if there are more pages
        hasMore = allStudies.length < total;
        page++;
        
        // Safety check: if no studies returned, stop
        if (studies.length === 0) {
          hasMore = false;
        }
      }

      return {
        success: true,
        data: allStudies
      };
    } catch (error) {
      console.error('Failed to list studies:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to list studies',
        data: []
      };
    }
  },

  /**
   * Get detailed study info
   * @param {string} studyId - Study UUID
   * @returns {Promise<Object>} Study details with series
   */
  async getStudyDetails(studyId) {
    try {
      const response = await apiClient.get(`/studies/${studyId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to get study details:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to get study details'
      };
    }
  },

  /**
   * Delete a study
   * @param {string} studyId - Study UUID
   * @returns {Promise<{success: boolean}>}
   */
  async deleteStudy(studyId) {
    try {
      const response = await apiClient.delete(`/studies/${studyId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to delete study:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to delete study'
      };
    }
  }
};

export default dicomStudyService;