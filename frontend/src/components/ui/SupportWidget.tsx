import React, { useState } from 'react';
import { MessageSquareWarning, X, Send, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const SupportWidget: React.FC = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [category, setCategory] = useState('COMPLAINT');
 const [content, setContent] = useState('');
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 
 // Check if user is logged in
 const token = localStorage.getItem('token');
 if (!token) return null;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!content.trim()) return;
 
 setLoading(true);
 try {
 await api.post('/support-tickets', { category, content });
 setSuccess(true);
 setTimeout(() => {
 setIsOpen(false);
 setSuccess(false);
 setContent('');
 }, 3000);
 } catch (error) {
 console.error("Failed to send support ticket", error);
 alert("Có lỗi xảy ra, vui lòng thử lại sau.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <>
 <button
 onClick={() => setIsOpen(true)}
 className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 group"
 title="Hỗ trợ & Khiếu nại"
 >
 <div className="flex items-center gap-2">
 <MessageSquareWarning size={24} />
 <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap hidden md:inline-block">
 Khiếu nại / Hỗ trợ
 </span>
 </div>
 </button>

 {isOpen && (
 <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50 bg-white rounded-2xl shadow-2xl w-[90vw] md:w-96 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
 <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex justify-between items-center text-white">
 <h3 className="font-bold flex items-center gap-2">
 <MessageSquareWarning size={20} />
 Hỗ trợ & Khiếu nại
 </h3>
 <button onClick={() => setIsOpen(false)} className="text-indigo-100 hover:text-white transition-colors">
 <X size={20} />
 </button>
 </div>
 
 <div className="p-5">
 {success ? (
 <div className="text-center py-6 animate-in zoom-in">
 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
 <Send size={32} />
 </div>
 <h4 className="font-bold text-gray-900 mb-2">Đã Gửi Thành Công!</h4>
 <p className="text-sm text-gray-500">Chúng tôi đã tiếp nhận yêu cầu và ban quản trị sẽ phản hồi sớm nhất có thể.</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-semibold text-gray-700 mb-1">Loại yêu cầu</label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black p-2 border bg-gray-50 text-sm"
 >
 <option value="COMPLAINT">Khiếu Nại / Tố cáo vi phạm</option>
 <option value="PAYMENT">Vấn đề thanh toán / Rút tiền</option>
 <option value="SUPPORT">Hỗ trợ kỹ thuật</option>
 <option value="OTHER">Vấn đề khác</option>
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung chi tiết</label>
 <textarea
 value={content}
 onChange={(e) => setContent(e.target.value)}
 placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
 rows={4}
 required
 className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black p-3 border bg-gray-50 text-sm resize-none"
 />
 <p className="text-xs text-gray-500 mt-2">Bằng việc gửi yêu cầu, bạn đồng ý với các quy định giải quyết khiếu nại của hệ thống.</p>
 </div>
 
 <button
 type="submit"
 disabled={loading || !content.trim()}
 className="w-full flex justify-center items-center gap-2 bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
 >
 {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
 Gửi Yêu Cầu Cho Admin
 </button>
 </form>
 )}
 </div>
 </div>
 )}
 </>
 );
};
