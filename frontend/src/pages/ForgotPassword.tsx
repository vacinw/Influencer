import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
 const [email, setEmail] = useState('');
 const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
 const [message, setMessage] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!email) return;

 setStatus('loading');
 setMessage('');

 try {
 const response = await api.post('/auth/forgot-password', { email });
 setStatus('success');
 setMessage(response.data.message || 'Mật khẩu mới đã được gửi vào email của bạn.');
 } catch (error: any) {
 setStatus('error');
 setMessage(
 error.response?.data?.message || 
 'Có lỗi xảy ra khi yêu cầu thiết lập lại mật khẩu.'
 );
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="flex justify-center text-indigo-600">
 <Mail size={48} />
 </div>
 <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
 Quên mật khẩu
 </h2>
 <p className="mt-2 text-center text-sm text-gray-600">
 Nhập email của bạn và chúng tôi sẽ gửi một mật khẩu tạm thời.
 </p>
 </div>

 <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
 {status === 'success' ? (
 <div className="text-center">
 <div className="rounded-md bg-green-50 p-4 mb-6">
 <div className="flex">
 <div className="ml-3">
 <h3 className="text-sm font-medium text-green-800">
 Yêu cầu thành công!
 </h3>
 <div className="mt-2 text-sm text-green-700">
 <p>{message}</p>
 </div>
 </div>
 </div>
 </div>
 <Link 
 to="/login" 
 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none "
 >
 Quay lại Đăng nhập
 </Link>
 </div>
 ) : (
 <form className="space-y-6" onSubmit={handleSubmit}>
 {status === 'error' && (
 <div className="rounded-md bg-red-50 p-4">
 <div className="flex">
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800">
 Lỗi
 </h3>
 <div className="mt-2 text-sm text-red-700">
 <p>{message}</p>
 </div>
 </div>
 </div>
 </div>
 )}

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700">
 Địa chỉ Email
 </label>
 <div className="mt-1">
 <input
 id="email"
 name="email"
 type="email"
 autoComplete="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-black sm:text-sm"
 placeholder="you@example.com"
 />
 </div>
 </div>

 <div>
 <button
 type="submit"
 disabled={status === 'loading'}
 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
 >
 {status === 'loading' ? (
 <>
 <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
 Đang xử lý...
 </>
 ) : (
 'Gửi Mật Khẩu Mới'
 )}
 </button>
 </div>
 
 <div className="mt-6 flex items-center justify-center">
 <div className="text-sm">
 <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
 <ArrowLeft size={16} className="mr-1" /> Quay lại đăng nhập
 </Link>
 </div>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 );
};

export default ForgotPassword;
