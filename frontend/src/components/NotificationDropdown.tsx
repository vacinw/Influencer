import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
 id: number;
 title: string;
 content: string;
 link: string;
 isRead: boolean;
 createdAt: string;
}

const NotificationDropdown = () => {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const navigate = useNavigate();

 const fetchNotifications = async () => {
 try {
 const res = await api.get('/notifications');
 setNotifications(res.data.notifications);
 setUnreadCount(res.data.unreadCount);
 } catch (error) {
 console.error('Failed to fetch notifications', error);
 }
 };

 useEffect(() => {
 fetchNotifications();

 // Optional: Polling every 30 seconds for new notifications
 const intervalId = setInterval(fetchNotifications, 30000);
 return () => clearInterval(intervalId);
 }, []);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleNotificationClick = async (notification: Notification) => {
 // Mark as read if unread
 if (!notification.isRead) {
 try {
 await api.put(`/notifications/${notification.id}/read`);
 setUnreadCount(prev => Math.max(0, prev - 1));
 setNotifications(notifications.map(n =>
 n.id === notification.id ? { ...n, isRead: true } : n
 ));
 } catch (error) {
 console.error('Failed to mark notification as read', error);
 }
 }

 // Close dropdown
 setIsOpen(false);

 // Navigate
 if (notification.link) {
 navigate(notification.link);
 }
 };

 const handleMarkAllAsRead = async () => {
 try {
 await api.put(`/notifications/mark-all-read`);
 setUnreadCount(0);
 setNotifications(notifications.map(n => ({ ...n, isRead: true })));
 } catch (error) {
 console.error('Failed to mark all as read', error);
 }
 }

 return (
 <div className="relative" ref={dropdownRef}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 outline-none"
 >
 <span className="sr-only">View notifications</span>
 <Bell size={20} />
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
 )}
 </button>

 {isOpen && (
 <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white border border-gray-100 focus:outline-none z-50">
 <div className="p-3 border-b border-gray-100 flex justify-between items-center">
 <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
 {unreadCount > 0 && (
 <button onClick={handleMarkAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
 Đánh dấu tất cả đã đọc
 </button>
 )}
 </div>
 <div className="max-h-96 overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center">
 <Bell size={24} className="text-gray-300 mb-2" />
 Chưa có thông báo nào.
 </div>
 ) : (
 <ul className="divide-y divide-gray-100">
 {notifications.map((notification) => (
 <li
 key={notification.id}
 onClick={() => handleNotificationClick(notification)}
 className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${!notification.isRead ? 'bg-indigo-50/50' : ''}`}
 >
 <div className="flex gap-3">
 <div className="flex-1 min-w-0">
 <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
 {notification.title}
 </p>
 <p className="text-sm text-gray-500 truncate">
 {notification.content}
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(notification.createdAt).toLocaleString()}
 </p>
 </div>
 {!notification.isRead && (
 <div className="flex-shrink-0 mt-1.5">
 <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
 </div>
 )}
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>
 )}
 </div>
 );
};

export default NotificationDropdown;
