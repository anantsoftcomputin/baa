import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from './config';

// User Events
export const logLogin = (method) => {
  if (analytics) {
    logEvent(analytics, 'login', {
      method: method // 'email', 'google'
    });
  }
};

export const logSignUp = (method) => {
  if (analytics) {
    logEvent(analytics, 'sign_up', {
      method: method
    });
  }
};

export const setAnalyticsUser = (userId, properties = {}) => {
  if (analytics) {
    setUserId(analytics, userId);
    if (Object.keys(properties).length > 0) {
      setUserProperties(analytics, properties);
    }
  }
};

// Post Events
export const logPostCreated = (postId) => {
  if (analytics) {
    logEvent(analytics, 'post_created', {
      post_id: postId
    });
  }
};

export const logPostLiked = (postId) => {
  if (analytics) {
    logEvent(analytics, 'post_liked', {
      post_id: postId
    });
  }
};

export const logPostCommented = (postId) => {
  if (analytics) {
    logEvent(analytics, 'post_commented', {
      post_id: postId
    });
  }
};

export const logPostShared = (postId) => {
  if (analytics) {
    logEvent(analytics, 'share', {
      content_type: 'post',
      content_id: postId
    });
  }
};

// Event Events
export const logEventViewed = (eventId, eventName) => {
  if (analytics) {
    logEvent(analytics, 'view_item', {
      item_id: eventId,
      item_name: eventName,
      item_category: 'event'
    });
  }
};

export const logEventRegistered = (eventId, eventName) => {
  if (analytics) {
    logEvent(analytics, 'event_registration', {
      event_id: eventId,
      event_name: eventName
    });
  }
};

// Initiative Events
export const logInitiativeViewed = (initiativeId, initiativeName) => {
  if (analytics) {
    logEvent(analytics, 'view_item', {
      item_id: initiativeId,
      item_name: initiativeName,
      item_category: 'initiative'
    });
  }
};

// Profile Events
export const logProfileViewed = (profileUserId) => {
  if (analytics) {
    logEvent(analytics, 'view_profile', {
      profile_user_id: profileUserId
    });
  }
};

export const logProfileUpdated = () => {
  if (analytics) {
    logEvent(analytics, 'profile_updated');
  }
};

export const logUserFollowed = (followedUserId) => {
  if (analytics) {
    logEvent(analytics, 'user_followed', {
      followed_user_id: followedUserId
    });
  }
};

export const logUserUnfollowed = (unfollowedUserId) => {
  if (analytics) {
    logEvent(analytics, 'user_unfollowed', {
      unfollowed_user_id: unfollowedUserId
    });
  }
};

// Membership Events
export const logMembershipPurchaseInitiated = () => {
  if (analytics) {
    logEvent(analytics, 'begin_checkout', {
      currency: 'INR',
      value: 500, // Update with actual membership price
      items: [{
        item_id: 'membership',
        item_name: 'BAA Membership'
      }]
    });
  }
};

export const logMembershipPurchaseCompleted = (transactionId) => {
  if (analytics) {
    logEvent(analytics, 'purchase', {
      transaction_id: transactionId,
      currency: 'INR',
      value: 500, // Update with actual membership price
      items: [{
        item_id: 'membership',
        item_name: 'BAA Membership'
      }]
    });
  }
};

// Search Events
export const logSearch = (searchTerm, searchCategory) => {
  if (analytics) {
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      search_category: searchCategory // 'users', 'events', 'posts', etc.
    });
  }
};

// Page View Events
export const logPageView = (pageName, pageLocation) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: pageLocation
    });
  }
};

// Admin Events
export const logAdminAction = (action, resourceType, resourceId) => {
  if (analytics) {
    logEvent(analytics, 'admin_action', {
      action: action, // 'create', 'update', 'delete'
      resource_type: resourceType, // 'event', 'initiative', 'user', etc.
      resource_id: resourceId
    });
  }
};

// Error Events
export const logError = (errorMessage, errorContext) => {
  if (analytics) {
    logEvent(analytics, 'exception', {
      description: errorMessage,
      fatal: false,
      context: errorContext
    });
  }
};

// Contact Form
export const logContactFormSubmitted = () => {
  if (analytics) {
    logEvent(analytics, 'contact_form_submitted');
  }
};

// Feedback Form
export const logFeedbackSubmitted = (feedbackType) => {
  if (analytics) {
    logEvent(analytics, 'feedback_submitted', {
      feedback_type: feedbackType
    });
  }
};
