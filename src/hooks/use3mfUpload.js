/**
 * use3mfUpload.js
 * Hook to upload a .3mf file to Firebase Storage under /3mf/<uuid>_<filename>.
 * Returns the public download URL and upload progress state.
 */
import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export function use3mfUpload() {
  const [uploadProgress, setUploadProgress] = useState(null); // null | 0–100
  const [uploadError, setUploadError] = useState(null);

  /**
   * Upload a File to Firebase Storage.
   * @param {File} file  — the .3mf File object
   * @returns {Promise<string>}  — the public download URL
   */
  const upload3mf = (file) => {
    return new Promise((resolve, reject) => {
      setUploadProgress(0);
      setUploadError(null);

      // Build a unique path: 3mf/<timestamp>_<filename>
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `3mf/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(pct);
        },
        (error) => {
          console.error('3MF upload error:', error);
          setUploadError(error.message || 'Upload failed.');
          setUploadProgress(null);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadProgress(null);
          resolve(url);
        }
      );
    });
  };

  const resetUpload = () => {
    setUploadProgress(null);
    setUploadError(null);
  };

  return { upload3mf, uploadProgress, uploadError, resetUpload };
}
