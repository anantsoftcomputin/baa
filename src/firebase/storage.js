import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { storage } from "./config";

/**
 * Upload file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'posts/userId/filename')
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<string>} Download URL of uploaded file
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (userId, file, onProgress = null) => {
  const path = `profiles/${userId}/profile-picture`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload post image
 */
export const uploadPostImage = async (userId, file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `posts/${userId}/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload event image
 */
export const uploadEventImage = async (eventId, file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `events/${eventId}/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload initiative image
 */
export const uploadInitiativeImage = async (initiativeId, file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `initiatives/${initiativeId}/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload gallery image
 */
export const uploadGalleryImage = async (file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `gallery/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload blog image
 */
export const uploadBlogImage = async (blogId, file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `blogs/${blogId}/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Upload website content image (hero, about, etc.)
 */
export const uploadWebsiteImage = async (section, file, onProgress = null) => {
  const timestamp = Date.now();
  const path = `website/${section}/${timestamp}_${file.name}`;
  return await uploadFile(file, path, onProgress);
};

/**
 * Delete file from storage
 */
export const deleteFile = async (fileUrl) => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files, basePath, onProgress = null) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return uploadFile(file, path, onProgress);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
};

const storageApi = {
  uploadFile,
  uploadProfilePicture,
  uploadPostImage,
  uploadEventImage,
  uploadInitiativeImage,
  uploadGalleryImage,
  uploadBlogImage,
  uploadWebsiteImage,
  deleteFile,
  uploadMultipleFiles
};

export default storageApi;
