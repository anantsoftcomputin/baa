import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from "firebase/firestore";
import { db } from "./config";

// ==================== USER PROFILES ====================

/**
 * Create user profile
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get users by graduation year
 */
export const getUsersByYear = async (year) => {
  try {
    const usersRef = collection(db, "users");
    let q;
    
    if (year) {
      q = query(usersRef, where("school_graduation_year", "==", parseInt(year)));
    } else {
      q = query(usersRef);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting users by year:", error);
    throw error;
  }
};

/**
 * Follow/Unfollow user
 */
export const toggleFollow = async (currentUserId, targetUserId, isFollowing) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    if (isFollowing) {
      // Unfollow
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      });
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId)
      });
    } else {
      // Follow
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      });
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId)
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error toggling follow:", error);
    throw error;
  }
};

// ==================== POSTS ====================

/**
 * Create post
 */
export const createPost = async (postData) => {
  try {
    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, {
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Get all posts
 */
export const getAllPosts = async (limitCount = 50) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting posts:", error);
    throw error;
  }
};

/**
 * Get posts by user
 */
export const getPostsByUser = async (userId) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("author", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting posts by user:", error);
    throw error;
  }
};

/**
 * Get popular posts
 */
export const getPopularPosts = async (limitCount = 20) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("likesCount", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting popular posts:", error);
    throw error;
  }
};

/**
 * Toggle like on post
 */
export const toggleLike = async (postId, userId, isLiked) => {
  try {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "likes", `${postId}_${userId}`);

    if (isLiked) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1)
      });
    } else {
      // Like
      await setDoc(likeRef, {
        postId: postId,
        userId: userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

/**
 * Check if user liked post
 */
export const checkUserLiked = async (postId, userId) => {
  try {
    const likeRef = doc(db, "likes", `${postId}_${userId}`);
    const likeSnap = await getDoc(likeRef);
    return likeSnap.exists();
  } catch (error) {
    console.error("Error checking like:", error);
    return false;
  }
};

/**
 * Add comment to post
 */
export const addComment = async (postId, userId, content, username, parentCommentId = null) => {
  try {
    const commentsRef = collection(db, "comments");
    const commentData = {
      postId: postId,
      userId: userId,
      username: username,
      content: content,
      createdAt: serverTimestamp(),
      parentCommentId: parentCommentId
    };
    
    const docRef = await addDoc(commentsRef, commentData);

    // Increment comment count
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

/**
 * Get comments for post
 */
export const getComments = async (postId) => {
  try {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("postId", "==", postId), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

/**
 * Share post
 */
export const sharePost = async (postId, userId, platform) => {
  try {
    const sharesRef = collection(db, "shares");
    await addDoc(sharesRef, {
      postId,
      userId,
      platform,
      createdAt: serverTimestamp()
    });
    
    // Increment share count
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      sharesCount: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error("Error sharing post:", error);
    throw error;
  }
};

// ==================== EVENTS ====================

/**
 * Create event
 */
export const createEvent = async (eventData) => {
  try {
    const eventsRef = collection(db, "events");
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Get all events
 */
export const getAllEvents = async () => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("start_date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const docRef = doc(db, "events", eventId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, "events", eventId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// ==================== INITIATIVES ====================

/**
 * Create initiative
 */
export const createInitiative = async (initiativeData) => {
  try {
    const initiativesRef = collection(db, "initiatives");
    const docRef = await addDoc(initiativesRef, {
      ...initiativeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating initiative:", error);
    throw error;
  }
};

/**
 * Update initiative
 */
export const updateInitiative = async (id, initiativeData) => {
  try {
    const docRef = doc(db, "initiatives", id);
    await updateDoc(docRef, {
      ...initiativeData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating initiative:", error);
    throw error;
  }
};

/**
 * Delete initiative
 */
export const deleteInitiative = async (id) => {
  try {
    await deleteDoc(doc(db, "initiatives", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting initiative:", error);
    throw error;
  }
};

/**
 * Get all initiatives
 */
export const getAllInitiatives = async () => {
  try {
    const initiativesRef = collection(db, "initiatives");
    const q = query(initiativesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting initiatives:", error);
    throw error;
  }
};

// ==================== WEBSITE CONTENT ====================

/**
 * Get website content (about us, achievements, etc.)
 */
export const getWebsiteContent = async (contentType) => {
  try {
    const docRef = doc(db, "websiteContent", contentType);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting website content:", error);
    throw error;
  }
};

/**
 * Update website content
 */
export const updateWebsiteContent = async (contentType, data) => {
  try {
    const docRef = doc(db, "websiteContent", contentType);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating website content:", error);
    throw error;
  }
};

/**
 * Get all testimonials
 */
export const getTestimonials = async () => {
  try {
    const testimonialsRef = collection(db, "testimonials");
    const querySnapshot = await getDocs(testimonialsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting testimonials:", error);
    throw error;
  }
};

/**
 * Add testimonial
 */
export const addTestimonial = async (testimonialData) => {
  try {
    const testimonialsRef = collection(db, "testimonials");
    const docRef = await addDoc(testimonialsRef, {
      ...testimonialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }
};

/**
 * Update testimonial
 */
export const updateTestimonial = async (id, testimonialData) => {
  try {
    const docRef = doc(db, "testimonials", id);
    await updateDoc(docRef, {
      ...testimonialData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (id) => {
  try {
    await deleteDoc(doc(db, "testimonials", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw error;
  }
};

/**
 * Get all committee members
 */
export const getCommitteeMembers = async () => {
  try {
    const committeeRef = collection(db, "committee");
    const q = query(committeeRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting committee members:", error);
    throw error;
  }
};

/**
 * Add committee member
 */
export const addCommitteeMember = async (memberData) => {
  try {
    const committeeRef = collection(db, "committee");
    const docRef = await addDoc(committeeRef, {
      ...memberData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding committee member:", error);
    throw error;
  }
};

/**
 * Update committee member
 */
export const updateCommitteeMember = async (id, memberData) => {
  try {
    const docRef = doc(db, "committee", id);
    await updateDoc(docRef, {
      ...memberData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating committee member:", error);
    throw error;
  }
};

/**
 * Delete committee member
 */
export const deleteCommitteeMember = async (id) => {
  try {
    await deleteDoc(doc(db, "committee", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting committee member:", error);
    throw error;
  }
};

/**
 * Get all achievements
 */
export const getAchievements = async () => {
  try {
    const achievementsRef = collection(db, "achievements");
    const querySnapshot = await getDocs(achievementsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting achievements:", error);
    throw error;
  }
};

/**
 * Add achievement
 */
export const addAchievement = async (achievementData) => {
  try {
    const achievementsRef = collection(db, "achievements");
    const docRef = await addDoc(achievementsRef, {
      ...achievementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding achievement:", error);
    throw error;
  }
};

/**
 * Update achievement
 */
export const updateAchievement = async (id, achievementData) => {
  try {
    const docRef = doc(db, "achievements", id);
    await updateDoc(docRef, {
      ...achievementData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating achievement:", error);
    throw error;
  }
};

/**
 * Delete achievement
 */
export const deleteAchievement = async (id) => {
  try {
    await deleteDoc(doc(db, "achievements", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting achievement:", error);
    throw error;
  }
};

/**
 * Get all blogs
 */
export const getBlogs = async () => {
  try {
    const blogsRef = collection(db, "blogs");
    const q = query(blogsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting blogs:", error);
    throw error;
  }
};

/**
 * Add blog
 */
export const addBlog = async (blogData) => {
  try {
    const blogsRef = collection(db, "blogs");
    const docRef = await addDoc(blogsRef, {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding blog:", error);
    throw error;
  }
};

/**
 * Update blog
 */
export const updateBlog = async (id, blogData) => {
  try {
    const docRef = doc(db, "blogs", id);
    await updateDoc(docRef, {
      ...blogData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

/**
 * Delete blog
 */
export const deleteBlog = async (id) => {
  try {
    await deleteDoc(doc(db, "blogs", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

/**
 * Get gallery images
 */
export const getGalleryImages = async () => {
  try {
    const galleryRef = collection(db, "gallery");
    const querySnapshot = await getDocs(galleryRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting gallery images:", error);
    throw error;
  }
};

/**
 * Add gallery image
 */
export const addGalleryImage = async (imageData) => {
  try {
    const galleryRef = collection(db, "gallery");
    const docRef = await addDoc(galleryRef, {
      ...imageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding gallery image:", error);
    throw error;
  }
};

/**
 * Update gallery image
 */
export const updateGalleryImage = async (id, imageData) => {
  try {
    const docRef = doc(db, "gallery", id);
    await updateDoc(docRef, {
      ...imageData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating gallery image:", error);
    throw error;
  }
};

/**
 * Delete gallery image
 */
export const deleteGalleryImage = async (id) => {
  try {
    await deleteDoc(doc(db, "gallery", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    throw error;
  }
};

/**
 * Get hero images for landing page
 */
export const getHeroImages = async () => {
  try {
    // Get from websiteContent document
    const docRef = doc(db, "websiteContent", "heroImages");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().images) {
      return docSnap.data().images;
    }
    return [];
  } catch (error) {
    console.error("Error getting hero images:", error);
    return [];
  }
};

/**
 * Submit contact form
 */
export const submitContactForm = async (formData) => {
  try {
    await addDoc(collection(db, "contactSubmissions"), {
      ...formData,
      createdAt: serverTimestamp(),
      status: "new",
      group: formData.group || "general"
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
};

/**
 * Get all contact submissions
 */
export const getContactSubmissions = async () => {
  try {
    const q = query(collection(db, "contactSubmissions"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting contact submissions:", error);
    throw error;
  }
};

/**
 * Update contact submission status
 */
export const updateContactStatus = async (contactId, status) => {
  try {
    const contactRef = doc(db, "contactSubmissions", contactId);
    await updateDoc(contactRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
};

/**
 * Delete contact submission
 */
export const deleteContactSubmission = async (contactId) => {
  try {
    await deleteDoc(doc(db, "contactSubmissions", contactId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    throw error;
  }
};

/**
 * Submit feedback
 */
export const submitFeedback = async (feedbackData) => {
  try {
    await addDoc(collection(db, "feedback"), {
      ...feedbackData,
      createdAt: serverTimestamp(),
      status: "new"
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

// ==================== MEMBERSHIP ====================

/**
 * Update membership status
 */
export const updateMembershipStatus = async (userId, paymentData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      is_member: true,
      membershipDate: serverTimestamp(),
      paymentDetails: paymentData
    });

    // Store payment record
    const paymentsRef = collection(db, "payments");
    await addDoc(paymentsRef, {
      userId: userId,
      amount: paymentData.amount,
      paymentId: paymentData.paymentId,
      orderId: paymentData.orderId,
      status: "completed",
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating membership:", error);
    throw error;
  }
};

/**
 * Check membership status
 */
export const checkMembershipStatus = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.is_member || false;
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listen to posts in real-time
 */
export const subscribeToPosts = (callback) => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(posts);
  });
};

/**
 * Listen to user profile changes
 */
export const subscribeToUserProfile = (userId, callback) => {
  const docRef = doc(db, "users", userId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export default {
  // Users
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUsersByYear,
  toggleFollow,
  
  // Posts
  createPost,
  getAllPosts,
  getPostsByUser,
  getPopularPosts,
  toggleLike,
  checkUserLiked,
  addComment,
  getComments,
  sharePost,
  
  // Events
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  
  // Initiatives
  createInitiative,
  getAllInitiatives,
  
  // Website Content
  getWebsiteContent,
  updateWebsiteContent,
  getTestimonials,
  getCommitteeMembers,
  getAchievements,
  getBlogs,
  getGalleryImages,
  getHeroImages,
  submitContactForm,
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  submitFeedback,
  
  // Membership
  updateMembershipStatus,
  checkMembershipStatus,
  
  // Real-time
  subscribeToPosts,
  subscribeToUserProfile
};
