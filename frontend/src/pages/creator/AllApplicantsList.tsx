import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ArrowLeft, CheckCircle, XCircle, MessageSquare, Briefcase } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AllApplicantsList = () => {
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isProcessingRef = useRef(false);

 useEffect(() => {
 const fetchData = async () => {
 try {
 const res = await api.get(`/application/creator-all`);
 setApplicants(res.data);
 } catch (error) {
 console.error("Failed to load applicants", error);
 showToast("Lỗi khi tải danh sách ứng viên", "error");
 } finally {
 setLoading(false);
 }
 };

 fetchData();
 }, [showToast]);

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      await api.put(`/application/${appId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      showToast(`Cập nhật trạng thái thành công!`, "success");
    } catch (error) {
      console.error("Failed to update status", error);
      showToast("Cập nhật trạng thái thất bại", "error");
    } finally {
      isProcessingRef.current = false;
    }
  };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <Loader2 className="animate-spin text-indigo-600" size={32} />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 p-6">
 <div className="max-w-5xl mx-auto">
 <button
 onClick={() => navigate('/creator/dashboard')}
 className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
 >
 <ArrowLeft size={20} className="mr-2" /> Quay Trở Về Bảng Điều Khiển
 </button>

 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tất Cả Ứng Viên Của Yêu Cầu</h1>
 <p className="text-gray-500 mt-1">Phân tích tất cả ứng viên đang quan tâm tới các chiến dịch của bạn.</p>
 </div>
 <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
 <span className="font-black text-2xl text-indigo-600">{applicants.length}</span>
 <span className="text-xs text-gray-500 uppercase font-black tracking-wider">Tổng Hồ Sơ</span>
 </div>
 </div>

 <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
 {applicants.length === 0 ? (
 <div className="p-16 text-center">
 <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
 <MessageSquare size={32} className="text-gray-400" />
 </div>
 <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa Có Ứng Viên Nào</h3>
 <p className="text-gray-500">Chưa có ai ứng tuyển vào các chiến dịch của bạn.</p>
 </div>
 ) : (
 <ul className="divide-y divide-gray-100">
 {applicants.map((app) => (
 <li key={app.id} className="p-6 hover:bg-indigo-50/30 transition-all duration-200">
 <div className="flex flex-col md:flex-row gap-6">
 {/* Avatar Column */}
 <div className="flex-shrink-0 flex flex-col items-center gap-2">
 {app.receiver?.avatarUrl ? (
 <img src={app.receiver.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-white" />
 ) : (
 <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-4 ring-white">
 {app.receiver?.name?.charAt(0) || 'U'}
 </div>
 )}
 </div>
 
 {/* Info Column */}
 <div className="flex-1">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
 <div>
 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 {app.receiver?.name || app.receiver?.email}
 {app.receiver?.rating && (
 <span className="flex items-center text-xs font-bold bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full shadow-sm">
 ⭐ {app.receiver.rating}
 </span>
 )}
 </h3>
 <p className="text-sm text-gray-500 font-medium">{app.receiver?.email}</p>
 </div>
 <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
 app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border border-green-200' :
 'bg-red-100 text-red-800 border border-red-200'
 }`}>
 {app.status === 'PENDING' ? 'Đang Chờ' :
 app.status === 'ACCEPTED' ? 'Đã Nhận' :
 app.status === 'REJECTED' ? 'Từ Chối' : 
 app.status === 'COMPLETED' ? 'Đã Hoàn Thành' : app.status}
 </span>
 </div>

 {/* Campaign Context Box */}
 <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
 <div className="bg-white p-2 rounded-lg shadow-sm">
 <Briefcase size={20} className="text-indigo-600" />
 </div>
 <div>
 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Ứng Tuyển Vào</p>
 <p className="text-sm font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/creator/campaigns/${app.campaign?.id}`)}>
 {app.campaign?.title || 'Chiến dịch không xác định'}
 </p>
 </div>
 </div>

 {/* Pitch Message */}
 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
 <p className="text-xs font-black text-gray-400 uppercase mb-2 tracking-wider pl-2">Thông Điệp Giới Thiệu</p>
 <p className="text-sm text-gray-700 italic pl-2 leading-relaxed">"{app.message}"</p>
 </div>

 {app.bidAmount && (
 <div className="mt-4 flex items-center gap-2">
 <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Chi Phí Đề Xuất:</span>
 <span className="text-indigo-600 font-extrabold text-lg">{app.bidAmount.toLocaleString()} ₫</span>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3 mt-5">
 {app.status === 'PENDING' && (
 <>
 <button
 onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
 className="flex-1 md:flex-none flex justify-center items-center px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg transform active:scale-95"
 >
 <CheckCircle size={18} className="mr-2" /> Chấp Nhận Ứng Viên
 </button>
 <button
 onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
 className="flex-1 md:flex-none flex justify-center items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm transform active:scale-95"
 >
 <XCircle size={18} className="mr-2 text-gray-400" /> Bỏ Qua
 </button>
 </>
 )}
 {app.status === 'ACCEPTED' && (
 <button
 onClick={() => {
 navigate('/creator/dashboard');
 // Could also navigate to a specific job detail if linked
 }}
 className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
 >
 Xem Tiến Độ Job
 </button>
 )}
 </div>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>
 </div>
 );
};

export default AllApplicantsList;
