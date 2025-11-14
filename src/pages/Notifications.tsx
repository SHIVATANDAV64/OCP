import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const itemsPerPage = 15;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let notifs: Notification[] = [];

      if (filter === 'unread') {
        const allNotifs = await notificationService.getUserNotifications(user.$id, true);
        notifs = allNotifs.slice(offset, offset + itemsPerPage);
      } else {
        notifs = await notificationService.getAllUserNotifications(user.$id, itemsPerPage, offset);
      }

      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, filter]);

  const loadTotalCount = useCallback(async () => {
    if (!user) return;
    try {
      if (filter === 'unread') {
        const unreadNotifs = await notificationService.getUserNotifications(user.$id, true);
        setTotalCount(unreadNotifs.length);
      } else {
        const count = await notificationService.getTotalNotificationCount(user.$id);
        setTotalCount(count);
      }
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  }, [user, filter]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadNotifications();
      loadTotalCount();
    }
  }, [user, authLoading, navigate, loadNotifications, loadTotalCount]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification.$id);
      }

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }

      // Reload to update UI
      loadNotifications();
      loadTotalCount();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAsRead = async (notification: Notification, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification.$id);
        toast.success('Marked as read');
        loadNotifications();
        loadTotalCount();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDeleteNotification = async (notification: Notification, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notification.$id);
      toast.success('Notification deleted');
      loadNotifications();
      loadTotalCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.$id);
      toast.success('All notifications marked as read');
      loadNotifications();
      loadTotalCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="border-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">View all your notifications from all time</p>
        </div>

        {/* Filter and Actions */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
              className={filter === 'all' ? 'bg-gray-900 hover:bg-gray-800' : 'border-gray-300'}
            >
              All Notifications ({totalCount})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('unread');
                setCurrentPage(1);
              }}
              className={filter === 'unread' ? 'bg-gray-900 hover:bg-gray-800' : 'border-gray-300'}
            >
              Unread ({unreadCount})
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="border-gray-300"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-white border-gray-200">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="bg-white border-gray-200">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.$id}
                className={`bg-white border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-blue-600' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleMarkAsRead(notification, e)}
                          className="border-gray-300"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDeleteNotification(notification, e)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-gray-300"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const diff = Math.abs(page - currentPage);
                  return diff === 0 || diff === 1 || page === 1 || page === totalPages;
                })
                .map((page, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? 'bg-gray-900 hover:bg-gray-800'
                          : 'border-gray-300'
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
