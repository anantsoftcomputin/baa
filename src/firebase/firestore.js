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
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { slugify } from "../utils/format";

const withId = (snap) => ({ id: snap.id, ...snap.data() });
const listOf = (querySnapshot) => querySnapshot.docs.map(withId);

/** Firestore `in` queries accept at most 30 values; split larger lists. */
const chunk = (items, size = 30) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const byNewest = (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt);

// ==================== USER PROFILES ====================

export const createUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? withId(docSnap) : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Update the signed-in user's own profile. Privileged fields (role, membership,
 * followers) are stripped here and rejected by the security rules anyway.
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const {
      userRole,
      is_member,
      membershipDate,
      paymentDetails,
      followers,
      id,
      ...safeUpdates
    } = updates;
    await updateDoc(doc(db, "users", userId), {
      ...safeUpdates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/** Batch year is stored as `batchyear`; older profiles used `school_graduation_year`. */
export const getBatchYear = (user) => user?.batchyear ?? user?.school_graduation_year ?? null;

/**
 * Users in a given batch year, or everyone when no year is given.
 * Matches both numeric and string years, and the legacy field name.
 */
export const getUsersByYear = async (year) => {
  try {
    const usersRef = collection(db, "users");
    if (!year) {
      return listOf(await getDocs(usersRef));
    }

    const n = parseInt(year, 10);
    const values = [n, String(n)];
    const [current, legacy] = await Promise.all([
      getDocs(query(usersRef, where("batchyear", "in", values))),
      getDocs(query(usersRef, where("school_graduation_year", "in", values))),
    ]);

    const seen = new Map();
    [...listOf(current), ...listOf(legacy)].forEach((u) => seen.set(u.id, u));
    return [...seen.values()];
  } catch (error) {
    console.error("Error getting users by year:", error);
    throw error;
  }
};

export const getRecentUsers = async (limitCount = 12) => {
  try {
    const q = query(collection(db, "users"), limit(limitCount));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

/**
 * Follow / unfollow. Both sides are written atomically; the security rules let a
 * user edit someone else's `followers` only to add or remove themselves.
 */
export const toggleFollow = async (currentUserId, targetUserId, isFollowing) => {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    throw new Error("Invalid follow request");
  }
  try {
    const batch = writeBatch(db);
    const op = isFollowing ? arrayRemove : arrayUnion;
    batch.update(doc(db, "users", currentUserId), { following: op(targetUserId) });
    batch.update(doc(db, "users", targetUserId), { followers: op(currentUserId) });
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error toggling follow:", error);
    throw error;
  }
};

// ==================== POSTS ====================

/**
 * Create a post. `user_id` is the author's uid (the security rules check it).
 * `username` / `userPhoto` are denormalised so the feed can render without extra reads.
 */
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getAllPosts = async (limitCount = 50) => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting posts:", error);
    throw error;
  }
};

export const getPostsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "posts"),
      where("user_id", "==", userId),
      orderBy("createdAt", "desc")
    );
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting posts by user:", error);
    throw error;
  }
};

/** Posts written by any of the given users, newest first. */
export const getPostsByUsers = async (userIds = [], limitCount = 50) => {
  if (!userIds.length) return [];
  try {
    const batches = await Promise.all(
      chunk(userIds).map((ids) =>
        getDocs(
          query(
            collection(db, "posts"),
            where("user_id", "in", ids),
            orderBy("createdAt", "desc"),
            limit(limitCount)
          )
        )
      )
    );
    return batches.flatMap(listOf).sort(byNewest).slice(0, limitCount);
  } catch (error) {
    console.error("Error getting posts by followed users:", error);
    throw error;
  }
};

export const getPopularPosts = async (limitCount = 20) => {
  try {
    const q = query(collection(db, "posts"), orderBy("likesCount", "desc"), limit(limitCount));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting popular posts:", error);
    throw error;
  }
};

export const updatePost = async (postId, content) => {
  try {
    await updateDoc(doc(db, "posts", postId), { content, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

/** Like / unlike. The like document id is `${postId}_${userId}`. */
export const toggleLike = async (postId, userId, isLiked) => {
  try {
    const batch = writeBatch(db);
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "likes", `${postId}_${userId}`);

    if (isLiked) {
      batch.delete(likeRef);
      batch.update(postRef, { likesCount: increment(-1) });
    } else {
      batch.set(likeRef, { postId, userId, createdAt: serverTimestamp() });
      batch.update(postRef, { likesCount: increment(1) });
    }
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const checkUserLiked = async (postId, userId) => {
  try {
    const likeSnap = await getDoc(doc(db, "likes", `${postId}_${userId}`));
    return likeSnap.exists();
  } catch (error) {
    console.error("Error checking like:", error);
    return false;
  }
};

export const addComment = async (postId, userId, content, username, parentCommentId = null, userPhoto = null) => {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      postId,
      userId,
      username,
      userPhoto,
      content,
      createdAt: serverTimestamp(),
      parentCommentId,
    });
    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const deleteComment = async (commentId, postId) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(-1) });
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

export const sharePost = async (postId, userId, platform) => {
  try {
    await addDoc(collection(db, "shares"), {
      postId,
      userId,
      platform,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "posts", postId), { sharesCount: increment(1) });
    return true;
  } catch (error) {
    console.error("Error sharing post:", error);
    throw error;
  }
};

// ==================== EVENTS ====================

export const createEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const q = query(collection(db, "events"), orderBy("start_date", "desc"));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const docSnap = await getDoc(doc(db, "events", eventId));
    return docSnap.exists() ? withId(docSnap) : null;
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
  }
};

/**
 * Resolve an event from a URL segment, which may be a document id or a name slug
 * (older links used `/events/<slug>` with the id passed in router state).
 */
export const findEvent = async ({ id, slug }) => {
  const candidates = [id, slug].filter(Boolean);
  for (const candidate of candidates) {
    if (/^[A-Za-z0-9_-]{1,128}$/.test(candidate)) {
      const byId = await getEventById(candidate).catch(() => null);
      if (byId) return byId;
    }
  }
  if (!slug) return null;
  const events = await getAllEvents();
  return events.find((e) => slugify(e.name || e.title) === slugify(slug)) || null;
};

export const updateEvent = async (eventId, updates) => {
  try {
    await updateDoc(doc(db, "events", eventId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, "events", eventId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// ==================== EVENT REGISTRATIONS ====================

const toAmount = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Total in rupees for one alumnus plus guests. Mirrors functions/payments.js. */
export const eventRegistrationTotal = (event, guestCount = 0) => {
  const guests = Math.max(0, parseInt(guestCount, 10) || 0);
  return toAmount(event?.amount) + toAmount(event?.guest_amount) * guests;
};

export const isEventFree = (event) => eventRegistrationTotal(event, 0) === 0 && toAmount(event?.guest_amount) === 0;

export const registrationId = (eventId, userId) => `${eventId}_${userId}`;

export const getMyRegistration = async (eventId, userId) => {
  try {
    const snap = await getDoc(doc(db, "eventRegistrations", registrationId(eventId, userId)));
    return snap.exists() ? withId(snap) : null;
  } catch (error) {
    console.error("Error getting registration:", error);
    return null;
  }
};

export const getMyRegistrations = async (userId) => {
  try {
    const q = query(collection(db, "eventRegistrations"), where("userId", "==", userId));
    return listOf(await getDocs(q)).sort(byNewest);
  } catch (error) {
    console.error("Error getting registrations:", error);
    return [];
  }
};

/**
 * Register the user for an event. Free events are confirmed immediately; paid
 * events stay `pending_payment` until the payment Cloud Function confirms them.
 */
export const registerForEvent = async (event, user, { guests = [] } = {}) => {
  const cleanGuests = guests
    .map((g) => ({ name: (g.name || "").trim(), phone: (g.phone || "").trim() }))
    .filter((g) => g.name);
  const total = eventRegistrationTotal(event, cleanGuests.length);
  const free = total === 0;
  const id = registrationId(event.id, user.uid);

  await setDoc(doc(db, "eventRegistrations", id), {
    eventId: event.id,
    eventName: event.name || event.title || "",
    eventDate: event.start_date || null,
    userId: user.uid,
    username: user.username || "",
    email: user.email || "",
    guests: cleanGuests,
    guest_count: cleanGuests.length,
    total_amount: total,
    status: free ? "confirmed" : "pending_payment",
    payment_status: free ? "free" : "pending",
    createdAt: serverTimestamp(),
  });
  return { id, total, free };
};

export const cancelRegistration = async (id) => {
  await deleteDoc(doc(db, "eventRegistrations", id));
  return { success: true };
};

/** Admin only: everyone registered for an event. */
export const getEventRegistrations = async (eventId) => {
  try {
    const q = query(collection(db, "eventRegistrations"), where("eventId", "==", eventId));
    return listOf(await getDocs(q)).sort(byNewest);
  } catch (error) {
    console.error("Error getting event registrations:", error);
    throw error;
  }
};

// ==================== INITIATIVES ====================

export const createInitiative = async (initiativeData) => {
  try {
    const docRef = await addDoc(collection(db, "initiatives"), {
      ...initiativeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating initiative:", error);
    throw error;
  }
};

export const updateInitiative = async (id, initiativeData) => {
  try {
    await updateDoc(doc(db, "initiatives", id), {
      ...initiativeData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating initiative:", error);
    throw error;
  }
};

export const deleteInitiative = async (id) => {
  try {
    await deleteDoc(doc(db, "initiatives", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting initiative:", error);
    throw error;
  }
};

export const getAllInitiatives = async () => {
  try {
    const q = query(collection(db, "initiatives"), orderBy("createdAt", "desc"));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting initiatives:", error);
    throw error;
  }
};

export const getInitiativeById = async (id) => {
  try {
    const snap = await getDoc(doc(db, "initiatives", id));
    return snap.exists() ? withId(snap) : null;
  } catch (error) {
    console.error("Error getting initiative:", error);
    throw error;
  }
};

export const getMyContributions = async (userId) => {
  try {
    const q = query(collection(db, "contributions"), where("userId", "==", userId));
    return listOf(await getDocs(q)).sort(byNewest);
  } catch (error) {
    console.error("Error getting contributions:", error);
    return [];
  }
};

// ==================== WEBSITE CONTENT ====================

export const getWebsiteContent = async (contentType) => {
  try {
    const docSnap = await getDoc(doc(db, "websiteContent", contentType));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting website content:", error);
    throw error;
  }
};

export const updateWebsiteContent = async (contentType, data) => {
  try {
    await setDoc(
      doc(db, "websiteContent", contentType),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating website content:", error);
    throw error;
  }
};

export const DEFAULT_MEMBERSHIP_FEE = 2500;

/** Membership settings (`websiteContent/membership`). The fee is enforced server-side. */
export const getMembershipSettings = async () => {
  const data = await getWebsiteContent("membership").catch(() => null);
  return {
    amount: toAmount(data?.amount) || DEFAULT_MEMBERSHIP_FEE,
    benefits: Array.isArray(data?.benefits) ? data.benefits : null,
  };
};

export const getTestimonials = async () => {
  try {
    return listOf(await getDocs(collection(db, "testimonials")));
  } catch (error) {
    console.error("Error getting testimonials:", error);
    throw error;
  }
};

export const addTestimonial = async (testimonialData) => {
  try {
    const docRef = await addDoc(collection(db, "testimonials"), {
      ...testimonialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }
};

export const updateTestimonial = async (id, testimonialData) => {
  try {
    await updateDoc(doc(db, "testimonials", id), {
      ...testimonialData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
};

export const deleteTestimonial = async (id) => {
  try {
    await deleteDoc(doc(db, "testimonials", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw error;
  }
};

export const getCommitteeMembers = async () => {
  try {
    // Members added without an `order` field would be dropped by orderBy(), so sort client-side.
    const members = listOf(await getDocs(collection(db, "committee")));
    return members.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
  } catch (error) {
    console.error("Error getting committee members:", error);
    throw error;
  }
};

export const addCommitteeMember = async (memberData) => {
  try {
    const docRef = await addDoc(collection(db, "committee"), {
      ...memberData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding committee member:", error);
    throw error;
  }
};

export const updateCommitteeMember = async (id, memberData) => {
  try {
    await updateDoc(doc(db, "committee", id), {
      ...memberData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating committee member:", error);
    throw error;
  }
};

export const deleteCommitteeMember = async (id) => {
  try {
    await deleteDoc(doc(db, "committee", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting committee member:", error);
    throw error;
  }
};

export const getAchievements = async () => {
  try {
    return listOf(await getDocs(collection(db, "achievements")));
  } catch (error) {
    console.error("Error getting achievements:", error);
    throw error;
  }
};

export const addAchievement = async (achievementData) => {
  try {
    const docRef = await addDoc(collection(db, "achievements"), {
      ...achievementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding achievement:", error);
    throw error;
  }
};

export const updateAchievement = async (id, achievementData) => {
  try {
    await updateDoc(doc(db, "achievements", id), {
      ...achievementData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating achievement:", error);
    throw error;
  }
};

export const deleteAchievement = async (id) => {
  try {
    await deleteDoc(doc(db, "achievements", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting achievement:", error);
    throw error;
  }
};

export const getBlogs = async () => {
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting blogs:", error);
    throw error;
  }
};

export const getBlogById = async (id) => {
  try {
    const snap = await getDoc(doc(db, "blogs", id));
    return snap.exists() ? withId(snap) : null;
  } catch (error) {
    console.error("Error getting blog:", error);
    throw error;
  }
};

export const addBlog = async (blogData) => {
  try {
    const docRef = await addDoc(collection(db, "blogs"), {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding blog:", error);
    throw error;
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    await updateDoc(doc(db, "blogs", id), {
      ...blogData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    await deleteDoc(doc(db, "blogs", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

export const getGalleryImages = async () => {
  try {
    return listOf(await getDocs(collection(db, "gallery"))).sort(byNewest);
  } catch (error) {
    console.error("Error getting gallery images:", error);
    throw error;
  }
};

export const addGalleryImage = async (imageData) => {
  try {
    const docRef = await addDoc(collection(db, "gallery"), {
      ...imageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding gallery image:", error);
    throw error;
  }
};

export const updateGalleryImage = async (id, imageData) => {
  try {
    await updateDoc(doc(db, "gallery", id), {
      ...imageData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating gallery image:", error);
    throw error;
  }
};

export const deleteGalleryImage = async (id) => {
  try {
    await deleteDoc(doc(db, "gallery", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    throw error;
  }
};

export const getHeroImages = async () => {
  try {
    const docSnap = await getDoc(doc(db, "websiteContent", "heroImages"));
    if (docSnap.exists() && docSnap.data().images) {
      return docSnap.data().images;
    }
    return [];
  } catch (error) {
    console.error("Error getting hero images:", error);
    return [];
  }
};

export const submitContactForm = async (formData) => {
  try {
    await addDoc(collection(db, "contactSubmissions"), {
      ...formData,
      createdAt: serverTimestamp(),
      status: "new",
      group: formData.group || "general",
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
};

export const getContactSubmissions = async () => {
  try {
    const q = query(collection(db, "contactSubmissions"), orderBy("createdAt", "desc"));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting contact submissions:", error);
    throw error;
  }
};

export const updateContactStatus = async (contactId, status) => {
  try {
    await updateDoc(doc(db, "contactSubmissions", contactId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
};

export const deleteContactSubmission = async (contactId) => {
  try {
    await deleteDoc(doc(db, "contactSubmissions", contactId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    await addDoc(collection(db, "feedback"), {
      ...feedbackData,
      createdAt: serverTimestamp(),
      status: "new",
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const getFeedback = async () => {
  try {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    return listOf(await getDocs(q));
  } catch (error) {
    console.error("Error getting feedback:", error);
    throw error;
  }
};

export const deleteFeedback = async (id) => {
  await deleteDoc(doc(db, "feedback", id));
  return { success: true };
};

// ==================== MEMBERSHIP ====================

/**
 * Admin-only manual membership grant (e.g. for an offline payment).
 * Online payments are recorded by the `verifyPayment` Cloud Function.
 */
export const updateMembershipStatus = async (userId, isMember = true) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      is_member: !!isMember,
      membershipDate: isMember ? serverTimestamp() : null,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating membership:", error);
    throw error;
  }
};

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

export const subscribeToPosts = (callback) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => callback(listOf(snapshot)));
};

export const subscribeToUserProfile = (userId, callback) =>
  onSnapshot(doc(db, "users", userId), (snap) => {
    if (snap.exists()) callback(withId(snap));
  });

const firestoreApi = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUsersByYear,
  getRecentUsers,
  toggleFollow,
  createPost,
  getAllPosts,
  getPostsByUser,
  getPostsByUsers,
  getPopularPosts,
  updatePost,
  deletePost,
  toggleLike,
  checkUserLiked,
  addComment,
  deleteComment,
  getComments,
  sharePost,
  createEvent,
  getAllEvents,
  getEventById,
  findEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistration,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  getAllInitiatives,
  getInitiativeById,
  getMyContributions,
  getWebsiteContent,
  updateWebsiteContent,
  getMembershipSettings,
  getTestimonials,
  getCommitteeMembers,
  getAchievements,
  getBlogs,
  getBlogById,
  getGalleryImages,
  getHeroImages,
  submitContactForm,
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  submitFeedback,
  getFeedback,
  deleteFeedback,
  updateMembershipStatus,
  checkMembershipStatus,
  subscribeToPosts,
  subscribeToUserProfile,
};

export default firestoreApi;
