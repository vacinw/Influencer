import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ArrowLeft, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { Rating } from 'react-simple-star-rating';
import { useToast } from '../../context/ToastContext';

const ApplicantsList = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [applicants, setApplicants] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('');
 const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, receiverId: number | null }>({ isOpen: false, receiverId: null });
 const [reviewFormData, setReviewFormData] = useState({ rating: 0, content: '' });
 const [isSubmittingReview, setIsSubmittingReview] = useState(false);
 const isProcessingRef = useRef(false);

 useEffect(() => {
 const fetchData = async () => {
 try {
 // Fetch campaign info for title
 const campRes = await api.get(`/campaign/${id}`);
 setCampaignTitle(campRes.data.title);
 setCampaignStatus(campRes.data.status);

 // Fetch applications
 const res = await api.get(`/application/campaign/${id}`);
 setApplicants(res.data);
 } catch (error) {
 console.error("Failed to load data", error);
 showToast("Lỗi khi tải danh sách ứng viên", "error");
 } finally {
 setLoading(false);
 }
 };

 if (id) fetchData();
 }, [id, showToast]);

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

 const handleRating = (rate: number) => {
 setReviewFormData(prev => ({ ...prev, rating: rate }));
 };

  const submitReview = async () => {
 if (reviewFormData.rating === 0) {
 showToast("Vui lòng chọn số sao đánh giá", "error");
 return;
 }
 if (isProcessingRef.current) return;
 isProcessingRef.current = true;
 setIsSubmittingReview(true);
 try {
 await api.post('/reviews/create', {
 receiverId: reviewModal.receiverId,
 campaignId: Number(id),
 rating: reviewFormData.rating,
 content: reviewFormData.content
 });
 showToast("Gửi đánh giá thành công!", "success");
 setReviewModal({ isOpen: false, receiverId: null });
 setReviewFormData({ rating: 0, content: '' });
 // Optionally refresh applicants to reflect rating status (if updated in backend)
 } catch (error: any) {
 showToast(error.response?.data || "Gửi đánh giá thất bại", "error");
 } finally {
 isProcessingRef.current = false;
 setIsSubmittingReview(false);
 }
  };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <Loader2 className="animate-spin text-indigo-600" size={32} />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 p-6">
 <div className="max-w-4xl mx-auto">
 <button
 onClick={() => navigate(-1)}
 className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
 >
 <ArrowLeft size={20} className="mr-2" /> Quay Trở Lại Chiến Dịch
 </button>

 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl font-bold text-gray-900 mb-1">Danh Sách Ứng Viên</h1>
 <p className="text-gray-500">
 Thuộc chiến dịch: <span className="font-medium text-black">{campaignTitle}</span>
 </p>
 </div>
 <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 whitespace-nowrap inline-flex items-center self-start">
 <span className="font-bold text-indigo-600 mr-1.5">{applicants.length}</span> Hồ Sơ
 </div>
 </div>

 <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
 {applicants.length === 0 ? (
 <div className="p-12 text-center text-gray-500">
 <p>Chưa có ứng viên nào.</p>
 </div>
 ) : (
 <ul className="divide-y divide-gray-200">
 {applicants.map((app) => (
 <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-shrink-0">
 {app.receiver?.avatarUrl ? (
 <img src={app.receiver.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
 ) : (
 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
 {app.receiver?.name?.charAt(0) || 'U'}
 </div>
 )}
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <div>
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
 {app.receiver?.name || app.receiver?.email}
 {app.receiver?.rating > 0 && (
 <span className="flex items-center text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
 ⭐ {app.receiver.rating}
 </span>
 )}
 </h3>
 <p className="text-sm text-gray-500">{app.receiver?.email}</p>
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
 app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
 'bg-red-100 text-red-800'
 }`}>
 {app.status === 'PENDING' ? 'Đang Chờ' :
 app.status === 'ACCEPTED' ? 'Đã Chấp Nhận' :
 app.status === 'REJECTED' ? 'Bị Từ Chối' : 
 app.status === 'COMPLETED' ? 'Đã Hoàn Thành' : app.status}
 </span>
 </div>

 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 mt-3">
 <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Giới Thiệu</p>
 <div className="flex items-start text-sm text-gray-700">
 <MessageSquare size={16} className="mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
 <p className="italic">"{app.message}"</p>
 </div>
 {app.bidAmount && (
 <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
 <span className="text-xs font-semibold text-gray-400 uppercase">Chi Phí Đề Xuất</span>
 <span className="text-indigo-600 font-bold text-lg">{app.bidAmount.toLocaleString()} ₫</span>
 </div>
 )}
 </div>

 <div className="flex items-center gap-3 mt-4">
  <button
  onClick={() => navigate(`/profile/${app.receiver?.id}`)}
  className="text-sm text-indigo-600 font-medium hover:underline"
  >
  Xem Hồ Sơ
  </button>

 <div className="flex-1"></div>

 {app.status === 'PENDING' && (
 <>
 <button
 onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
 className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
 >
 <CheckCircle size={16} className="mr-2" /> Chấp Nhận
 </button>
 <button
 onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
 className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
 >
 <XCircle size={16} className="mr-2" /> Từ Chối
 </button>
 </>
 )}
 {app.status === 'ACCEPTED' && campaignStatus === 'COMPLETED' && (
 <button
 onClick={() => setReviewModal({ isOpen: true, receiverId: app.receiver.id })}
 className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
 >
 <Star size={16} className="mr-2 fill-white" /> Đánh Giá Tham Gia
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

 {/* Review Modal */}
 {reviewModal.isOpen && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-gray-900">Để lại đánh giá</h2>
 <button onClick={() => setReviewModal({ isOpen: false, receiverId: null })} className="text-gray-400 hover:text-gray-600">
 <XCircle size={24} />
 </button>
 </div>

 <div className="flex flex-col items-center mb-6">
 <p className="text-sm text-gray-600 mb-2 font-medium">Bạn cảm thấy làm việc với người này như thế nào?</p>
 <Rating
 onClick={handleRating}
 initialValue={reviewFormData.rating}
 size={40}
 transition
 fillColor="#f59e0b"
 emptyColor="#e5e7eb"
 SVGclassName="inline-block"
 />
 </div>

 <div className="mb-6">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Viết phản hồi của bạn <span className="text-gray-400 font-normal">(Không Bắt Buộc)</span>
 </label>
 <textarea
 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-black outline-none"
 rows={4}
 placeholder="Ghi nhận giao tiếp, chất lượng công việc,..."
 value={reviewFormData.content}
 onChange={(e) => setReviewFormData({ ...reviewFormData, content: e.target.value })}
 />
 </div>

 <div className="flex justify-end gap-3">
 <button
 onClick={() => setReviewModal({ isOpen: false, receiverId: null })}
 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
 disabled={isSubmittingReview}
 >
 Hủy
 </button>
 <button
 onClick={submitReview}
 disabled={isSubmittingReview}
 className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors flex items-center shadow-sm disabled:opacity-50"
 >
 {isSubmittingReview ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Gửi Đánh Giá'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default ApplicantsList;
