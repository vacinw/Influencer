import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Loader2 } from 'lucide-react';

const ChangePassword = () => {
 const { user } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();

 const [currentPassword, setCurrentPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');

 if (newPassword !== confirmPassword) {
 setError('Mật khẩu xác nhận không khớp');
 return;
 }

 if (newPassword.length < 6) {
 setError('Mật khẩu mới phải có ít nhất 6 ký tự');
 return;
 }

 setIsLoading(true);
 try {
 await api.put('/auth/change-password', {
 currentPassword,
 newPassword
 });
 showToast('Đổi mật khẩu thành công!', 'success');
 navigate('/profile');
 } catch (err: any) {
 setError(err.response?.data?.message || err.response?.data || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.');
 showToast('Lỗi đổi mật khẩu', 'error');
 } finally {
 setIsLoading(false);
 }
 };

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <Spinner />
 </div>
 );
 }

 return (
 <div className="max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8">
 <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
 <div className="text-center mb-8">
 <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
 <Lock className="h-6 w-6 text-indigo-600" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
 <p className="text-gray-500 mt-2 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
 <input
 type="password"
 required
 className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white transition-colors"
 placeholder="Nhập mật khẩu cũ"
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
 <input
 type="password"
 required
 className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white transition-colors"
 placeholder="Tối thiểu 6 ký tự"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
 <input
 type="password"
 required
 className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white transition-colors"
 placeholder="Nhập lại mật khẩu mới"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 />
 </div>

 {error && (
 <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
 {error}
 </div>
 )}

 <button
 type="submit"
 disabled={isLoading}
 className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none -gray-900 transition-colors disabled:opacity-50 mt-6"
 >
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Thay Đổi'}
 </button>
 
 <button
 type="button"
 onClick={() => navigate(-1)}
 className="w-full mt-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
 >
 Hủy
 </button>
 </form>
 </div>
 </div>
 );
};

const Spinner = () => <Loader2 className="animate-spin text-gray-400" size={32} />;

export default ChangePassword;
