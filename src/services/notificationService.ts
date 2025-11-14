import { dbService, ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { toast } from 'sonner';

export interface Notification {
  $id: string;
  id?: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// Track recently shown toasts to prevent duplicates (within 2 seconds)
const recentToasts = new Map<string, number>();

const createToastKey = (type: string, title: string, message: string): string => {
  return `${type}:${title}:${message}`;
};

const shouldShowToast = (key: string): boolean => {
  const now = Date.now();
  const lastTime = recentToasts.get(key) || 0;
  
  if (now - lastTime < 2000) {
    return false; // Don't show duplicate within 2 seconds
  }
  
  recentToasts.set(key, now);
  return true;
};

export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Promise<Notification> {
    const notificationData: any = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    };

    // Create notification in Appwrite
    const notification = await dbService.createDocument(COLLECTIONS.NOTIFICATIONS, notificationData);
    return notification as unknown as Notification;
  },

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    try {
      const queries = [Query.equal('userId', [userId])];
      if (unreadOnly) {
        queries.push(Query.equal('read', [false]));
      }

      const response = await dbService.listDocuments(COLLECTIONS.NOTIFICATIONS, queries);
      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      if (!notificationId) {
        console.error('Notification ID is required');
        return;
      }
      await dbService.updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      

      const notifications = await this.getUserNotifications(userId, true);
      const promises = notifications.map((n) => this.markAsRead(n.id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      

      await dbService.deleteDocument('notifications', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId, true);
      return notifications.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  /**
   * Get all notifications for a user (for notification page)
   */
  async getAllUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    try {
      const queries = [Query.equal('userId', [userId]), Query.limit(limit), Query.offset(offset)];
      const response = await dbService.listDocuments(COLLECTIONS.NOTIFICATIONS, queries);
      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return [];
    }
  },

  /**
   * Get total notification count for a user
   */
  async getTotalNotificationCount(userId: string): Promise<number> {
    try {
      const response = await dbService.listDocuments(COLLECTIONS.NOTIFICATIONS, [Query.equal('userId', [userId])]);
      return response.total;
    } catch (error) {
      console.error('Error getting total notification count:', error);
      return 0;
    }
  },

  // Helper functions for specific notification types
  async notifyEnrollment(userId: string, courseTitle: string): Promise<void> {
    const key = createToastKey('success', 'Course Enrollment Successful', courseTitle);
    
    await this.createNotification(
      userId,
      'success',
      'Course Enrollment Successful',
      `You have successfully enrolled in "${courseTitle}". Start learning now!`
    );
    
    if (shouldShowToast(key)) {
      toast.success(`Successfully enrolled in ${courseTitle}!`);
    }
  },

  async notifyCourseCompletion(userId: string, courseTitle: string, certificateId: string): Promise<void> {
    const key = createToastKey('success', 'Course Completed!', courseTitle);
    
    await this.createNotification(
      userId,
      'success',
      'Course Completed!',
      `Congratulations! You have completed "${courseTitle}". View your certificate.`,
      `/certificate/${certificateId}`
    );
    
    if (shouldShowToast(key)) {
      toast.success(`Congratulations! You completed ${courseTitle}!`, {
        description: 'Click here to view your certificate',
        action: {
          label: 'View Certificate',
          onClick: () => (window.location.href = `/certificate/${certificateId}`),
        },
      });
    }
  },

  async notifyQuizResult(
    userId: string,
    courseTitle: string,
    score: number,
    passed: boolean
  ): Promise<void> {
    const key = createToastKey(passed ? 'success' : 'info', passed ? 'Quiz Passed!' : 'Quiz Completed', `${score}%`);
    
    await this.createNotification(
      userId,
      passed ? 'success' : 'info',
      passed ? 'Quiz Passed!' : 'Quiz Completed',
      `You scored ${score}% on the "${courseTitle}" quiz. ${passed ? 'Great job!' : 'Keep practicing!'}`
    );
    
    if (shouldShowToast(key)) {
      if (passed) {
        toast.success(`Quiz Passed! You scored ${score}%`);
      } else {
        toast.info(`Quiz completed. You scored ${score}%. Try again to improve!`);
      }
    }
  },

  async notifyPaymentSuccess(userId: string, courseTitle: string, amount: number): Promise<void> {
    const key = createToastKey('success', 'Payment Successful', courseTitle);
    
    await this.createNotification(
      userId,
      'success',
      'Payment Successful',
      `Your payment of $${amount} for "${courseTitle}" was successful. You can now access the course.`
    );
    
    if (shouldShowToast(key)) {
      toast.success('Payment successful! You can now access the course.');
    }
  },

  async notifyCertificateIssued(userId: string, courseTitle: string, certificateId: string): Promise<void> {
    const key = createToastKey('success', 'Certificate Issued', courseTitle);
    
    await this.createNotification(
      userId,
      'success',
      'Certificate Issued',
      `Your certificate for "${courseTitle}" has been issued. Download it now!`,
      `/certificate/${certificateId}`
    );
    
    if (shouldShowToast(key)) {
      toast.success('Certificate issued! Download it now!');
    }
  },
};

export default notificationService;
