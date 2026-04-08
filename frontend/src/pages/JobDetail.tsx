import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Loader2, Send, Plus, Flag, AlertCircle, Briefcase, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { InstagramEmbed, TikTokEmbed, YouTubeEmbed } from 'react-social-media-embed';
import { Rating } from 'react-simple-star-rating';

const JobDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const { showToast } = useToast();
 const [job, setJob] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 // Action States
 const [submitting, setSubmitting] = useState<number | null>(null);
 const [evidenceUrl, setEvidenceUrl] = useState('');
 const [submissionDesc, setSubmissionDesc] = useState('');

 // Modal States
 const [showAddMilestone, setShowAddMilestone] = useState(false);
 const [newMilestone, setNewMilestone] = useState({ title: '', description: '', deadline: '' });

 const [rejectingId, setRejectingId] = useState<number | null>(null);
 const [rejectFeedback, setRejectFeedback] = useState('');

 const [showCompleteModal, setShowCompleteModal] = useState(false);

 const [role, setRole] = useState('');

 // Review States
 const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, receiverId: number | null }>({ isOpen: false, receiverId: null });
 const [reviewFormData, setReviewFormData] = useState({ rating: 0, content: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isProcessingRef = useRef(false);

 const fetchJob = async () => {
 setLoading(true);
 try {
 const response = await api.get(`/job/${id}`);
 setJob(response.data);
 } catch (error) {
 console.error("Failed to fetch job", error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchJob();
 if (user) {
 let roleName = '';
 if (typeof user.role === 'string') {
 roleName = user.role;
 } else if (user.role && typeof user.role === 'object' && 'name' in user.role) {
 roleName = user.role.name;
 }
 setRole((roleName || '').toUpperCase().replace('ROLE_', ''));
 }
 }, [id, user]);

  const handleAddMilestone = async () => {
    if (isProcessingRef.current || !newMilestone.title) return;
    isProcessingRef.current = true;
    try {
      await api.post(`/job/${id}/milestone`, newMilestone);
      setShowAddMilestone(false);
      setNewMilestone({ title: '', description: '', deadline: '' });
      fetchJob();
    } catch (error) {
      console.error("Failed to add milestone", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

 const handleCompleteJob = () => {
 setShowCompleteModal(true);
 };

  const confirmCompleteJob = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      await api.post(`/job/${id}/complete`, {});
      setShowCompleteModal(false);
      fetchJob();
    } catch (error) {
      console.error("Failed to complete job", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleSubmit = async (milestoneId: number) => {
    if (isProcessingRef.current || !evidenceUrl) return;
    isProcessingRef.current = true;
    setSubmitting(milestoneId);
    try {
      await api.post(`/job/${id}/milestone/${milestoneId}/submit`, {
        evidenceUrl,
        description: submissionDesc
      });
      fetchJob();
      setEvidenceUrl('');
      setSubmissionDesc('');
      setSubmitting(null);
    } catch (error) {
      console.error("Failed to submit", error);
      setSubmitting(null);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleApprove = async (milestoneId: number) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      await api.post(`/job/${id}/milestone/${milestoneId}/review`, { status: 'APPROVED' });
      fetchJob();
    } catch (error) {
      console.error("Failed to approve", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleReject = async () => {
    if (isProcessingRef.current || !rejectingId || !rejectFeedback) return;
    isProcessingRef.current = true;
    try {
      await api.post(`/job/${id}/milestone/${rejectingId}/review`, {
        status: 'REJECTED',
        feedback: rejectFeedback
      });
      setRejectingId(null);
      setRejectFeedback('');
      fetchJob();
    } catch (error) {
      console.error("Failed to reject", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

 const handleRating = (rate: number) => {
 setReviewFormData(prev => ({ ...prev, rating: rate }));
 };

  const submitReview = async () => {
    if (isProcessingRef.current || reviewFormData.rating === 0) {
      if (reviewFormData.rating === 0) showToast("Vui lòng chọn số sao để đánh giá", "error");
      return;
    }
    isProcessingRef.current = true;
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews/create', {
        receiverId: reviewModal.receiverId,
        campaignId: job.campaign.id,
        rating: reviewFormData.rating,
        content: reviewFormData.content
      });
      showToast("Gửi đánh giá thành công!", "success");
      setReviewModal({ isOpen: false, receiverId: null });
      setReviewFormData({ rating: 0, content: '' });
    } catch (error: any) {
      showToast(error.response?.data || "Gửi đánh giá thất bại", "error");
    } finally {
      setIsSubmittingReview(false);
      isProcessingRef.current = false;
    }
  };

 const renderSingleEvidence = (url: string, index: number) => {
 const containerClass = "mx-auto overflow-hidden rounded-lg shadow-sm border border-gray-200 mt-2";

 // Helper to render "Open Link" header for embeds might fail
 const renderEmbedHeader = (label: string, icon: any) => (
 <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs">
 <div className="flex items-center gap-2 text-gray-700 font-medium">
 {icon} {label}
 </div>
 <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
 <ExternalLink size={12} className="mr-1" /> Mở trong tab mới
 </a>
 </div>
 );

 if (url.includes('tiktok.com')) {
 const match = url.match(/video\/(\d+)/);
 if (match && match[1]) {
 const videoId = match[1];
 return (
 <div key={index} className={`${containerClass} w-full max-w-[325px]`}>
 {renderEmbedHeader('TikTok Video', <span className="font-bold">♪</span>)}
 <div className="h-[575px]">
 <iframe
 src={`https://www.tiktok.com/embed/v2/${videoId}`}
 className="w-full h-full border-0"
 allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
 title="TikTok Video"
 ></iframe>
 </div>
 </div>
 );
 }
 return <div key={index} className={`${containerClass} w-full max-w-[325px]`}><TikTokEmbed url={url} width="100%" /></div>;
 }
 if (url.includes('instagram.com')) {
 return <div key={index} className={`${containerClass} w-full max-w-[400px]`}><InstagramEmbed url={url} width="100%" /></div>;
 }
 if (url.includes('youtube.com') || url.includes('youtu.be')) {
 return <div key={index} className={`${containerClass} w-full max-w-[600px]`}><YouTubeEmbed url={url} width="100%" /></div>;
 }
 if (url.includes('facebook.com')) {
 return (
 <div key={index} className={`${containerClass} w-full max-w-[550px]`}>
 <iframe
 src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`}
 width="100%"
 height="500"
 style={{ border: 'none', overflow: 'hidden' }}
 scrolling="no"
 allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
 allowFullScreen={true}
 ></iframe>
 </div>
 );
 }

 if (url.includes('drive.google.com')) {
 // Folder Support
 if (url.includes('/folders/')) {
 const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
 if (folderMatch && folderMatch[1]) {
 return (
 <div key={index} className={`${containerClass} w-full`}>
 {renderEmbedHeader('Google Drive Folder', <Briefcase size={12} />)}
 <div className="h-[600px] relative bg-gray-50 flex flex-col items-center justify-center">
 <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs text-center z-0 px-4">
 Nếu bản xem trước này không tải được, vui lòng kiểm tra xem thư mục đã được chia sẻ "Bất kỳ ai có liên kết" chưa. <br />
 Hoặc nhấn "Mở trong tab mới" ở trên.
 </p>
 <iframe
 src={`https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`}
 width="100%"
 height="100%"
 className="relative z-10"
 style={{ border: 'none' }}
 title="Google Drive Folder"
 ></iframe>
 </div>
 </div>
 );
 }
 }

 // File Support
 const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
 if (match && match[1]) {
 return (
 <div key={index} className={`${containerClass} w-full`}>
 {renderEmbedHeader('Google Drive File', <Briefcase size={12} />)}
 <div className="h-[600px] relative bg-gray-50 flex flex-col items-center justify-center">
 <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs text-center z-0 px-4">
 Nếu bản xem trước này không tải được, vui lòng kiểm tra xem tệp đã được chia sẻ "Bất kỳ ai có liên kết" chưa.
 </p>
 <iframe
 src={`https://drive.google.com/file/d/${match[1]}/preview`}
 width="100%"
 height="100%"
 className="relative z-10"
 style={{ border: 'none' }}
 title="Google Drive Preview"
 allow="autoplay"
 ></iframe>
 </div>
 </div>
 );
 }
 }

 return (
 <div key={index} className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 mt-2 flex items-center justify-between">
 <span className="text-sm text-gray-600 truncate mr-2">{url}</span>
 <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline shrink-0">
 <ExternalLink size={14} className="mr-1" /> Mở
 </a>
 </div>
 );
 };

 const renderEvidence = (urlString: string) => {
 if (!urlString) return null;
 // Split by whitespace, comma, or newline
 const urls = urlString.split(/[\s,]+/).filter(u => u.length > 0);

 return (
 <div className="space-y-4">
 {urls.map((url, idx) => renderSingleEvidence(url, idx))}
 </div>
 );
 };

 if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
 if (!job) return <div className="p-8 text-center">Không tìm thấy công việc</div>;

 const allMilestonesApproved = job.milestones.every((m: any) => m.status === 'APPROVED');

 return (
 <div className="max-w-4xl mx-auto px-4 py-8 relative">
 <div className="flex justify-between items-center mb-6">
 <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
 <ArrowLeft size={16} className="mr-1" /> Quay lại
 </button>
 <div className="flex gap-2">
 {role === 'CREATOR' && job.status !== 'COMPLETED' && (
 <>
 {allMilestonesApproved && (
 <button
 onClick={handleCompleteJob}
 className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
 >
 <Flag size={14} className="mr-1" /> Hoàn Thành Công Việc
 </button>
 )}
 <button
 onClick={() => setShowAddMilestone(true)}
 className="flex items-center px-3 py-1 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
 >
 <Plus size={14} className="mr-1" /> Thêm Cột Mốc
 </button>
 </>
 )}
 {role === 'CREATOR' && job.status === 'COMPLETED' && job.influencer && (
 <button
 onClick={() => setReviewModal({ isOpen: true, receiverId: job.influencer.id })}
 className="flex items-center px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm"
 >
 <Star size={14} className="mr-1.5 fill-white" /> Đánh Giá KOL
 </button>
 )}
 {role === 'RECEIVER' && job.status === 'COMPLETED' && job.campaign?.creator && (
 <button
 onClick={() => setReviewModal({ isOpen: true, receiverId: job.campaign.creator.id })}
 className="flex items-center px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm"
 >
 <Star size={14} className="mr-1.5 fill-white" /> Đánh Giá Nhãn Hàng
 </button>
 )}
 <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded flex items-center">Đang xem dưới tư cách: {role === 'CREATOR' ? 'NHÀ SÁNG TẠO (KOL)' : role === 'RECEIVER' ? 'NHÃN HÀNG' : role}</span>
 </div>
 </div>

 <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
 <div className="px-6 py-5 border-b border-gray-200">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">{job.campaign.title}</h1>
 <p className="text-gray-500 mt-1">Mã đơn #{job.id} • Trạng thái: <span className={`font-medium tracking-wide ${job.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>
 {job.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' : job.status === 'PENDING' ? 'CHỜ XỬ LÝ' : job.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : job.status}
 </span></p>
 </div>
 </div>
 </div>
 <div className="px-6 py-5">
 <h3 className="text-lg font-medium text-gray-900 mb-2">Yêu Cầu Chiến Dịch</h3>
 <p className="text-gray-600">{job.description}</p>
 </div>
 </div>

 <h2 className="text-xl font-bold text-gray-900 mb-4">Cột Mốc & Nội Dung Bàn Giao</h2>
 <div className="space-y-4 pb-20">
 {job.milestones.map((milestone: any) => (
 <div key={milestone.id} className="bg-white shadow rounded-lg p-6">
 <div className="flex justify-between items-start mb-4">
 <div>
 <h3 className="text-lg font-medium text-gray-900">{milestone.title}</h3>
 <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
 <p className="text-xs text-gray-400 mt-2">Hạn chót: {new Date(milestone.deadline).toLocaleDateString()}</p>
 </div>
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${milestone.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
 milestone.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
 milestone.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
 'bg-yellow-100 text-yellow-800'
 }`}>
 {milestone.status === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' :
 milestone.status === 'PENDING' ? 'CHỜ DUYỆT' :
 milestone.status === 'REJECTED' ? 'BỊ TỪ CHỐI' : milestone.status}
 </span>
 </div>

 {/* Evidence Section */}
 {milestone.evidenceUrl && (
 <div className="mb-4">
 <div className="flex justify-between items-center bg-gray-50 p-2 rounded-t border-b border-gray-200">
 <p className="text-xs font-medium text-gray-500 uppercase">Bài nộp</p>
 <a href={milestone.evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-xs">
 <ExternalLink size={12} className="mr-1" /> Mở Liên Kết
 </a>
 </div>
 <div className="bg-gray-50 p-2 rounded-b">
 {milestone.submissionDescription && (
 <p className="text-sm text-gray-700 mb-3 italic">"{milestone.submissionDescription}"</p>
 )}
 {renderEvidence(milestone.evidenceUrl)}
 </div>
 </div>
 )}

 {/* Actions */}

 {/* Influencer Actions */}
 {role === 'RECEIVER' && milestone.status !== 'APPROVED' && job.status !== 'COMPLETED' && (
 <div className="mt-4 border-t pt-4">
 {milestone.status === 'PENDING' || milestone.status === 'REJECTED' ? (
 <div className="flex flex-col gap-3">
 <textarea
 placeholder="Thêm mô tả hoặc ghi chú cho bài nộp này..."
 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
 value={submitting === milestone.id ? submissionDesc : ''}
 onChange={(e) => {
 setSubmitting(milestone.id);
 setSubmissionDesc(e.target.value);
 }}
 />
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="Dán liên kết nội dung của bạn (Google Drive, TikTok...)"
 className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
 value={submitting === milestone.id ? evidenceUrl : ''}
 onChange={(e) => {
 setSubmitting(milestone.id);
 setEvidenceUrl(e.target.value);
 }}
 />
 <button
 onClick={() => handleSubmit(milestone.id)}
 disabled={!evidenceUrl && submitting === milestone.id}
 className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
 >
 <Send size={14} className="mr-1" /> Nộp Bài
 </button>
 </div>
 </div>
 ) : (
 <p className="text-sm text-gray-500 italic">Đang chờ duyệt...</p>
 )}
 {milestone.status === 'REJECTED' && (
 <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md flex items-start">
 <AlertCircle size={16} className="text-red-600 mt-0.5 mr-2 shrink-0" />
 <div>
 <p className="text-xs font-bold text-red-800 uppercase">Phản hồi từ Nhà Sáng Tạo</p>
 <p className="text-sm text-red-700">{milestone.creatorFeedback}</p>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Creator Actions */}
 {role === 'CREATOR' && milestone.status === 'PENDING' && (
 <div className="mt-4 border-t pt-4">
 <p className="text-sm text-gray-500 italic flex items-center">
 <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang chờ Influencer nộp bài...
 </p>
 </div>
 )}

 {role === 'CREATOR' && milestone.status === 'SUBMITTED' && (
 <div className="mt-6 border-t border-gray-100 pt-6 flex gap-4 justify-center">
 <button
 onClick={() => setRejectingId(milestone.id)}
 className="px-6 py-3 bg-white border-2 border-red-100 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-200 flex items-center shadow-sm active:scale-95"
 >
 <XCircle size={18} className="mr-2" /> Từ Chối
 </button>
 <button
 onClick={() => handleApprove(milestone.id)}
 className="group flex justify-center items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] transition-all duration-200 active:scale-95"
 >
 <CheckCircle size={18} className="mr-2 group-hover:scale-110 transition-transform" />
 <span>Duyệt Bài Nộp</span>
 </button>
 </div>
 )}

 {/* History Timeline */}
 {milestone.history && milestone.history.length > 0 && (
 <div className="mt-6 pt-4 border-t border-gray-100">
 <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Lịch sử</h4>
 <div className="space-y-4 px-1">
 {milestone.history.map((h: any) => (
 <div key={h.id} className="flex gap-3 relative">
 {/* Timeline Line */}
 <div className="absolute left-[9px] top-6 bottom-[-16px] w-[2px] bg-gray-100 last:hidden"></div>

 <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10 ${h.action === 'APPROVED' ? 'bg-green-100 text-green-600' :
 h.action === 'REJECTED' ? 'bg-red-100 text-red-600' :
 'bg-blue-100 text-blue-600'
 }`}>
 {h.action === 'APPROVED' && <CheckCircle size={12} strokeWidth={3} />}
 {h.action === 'REJECTED' && <XCircle size={12} strokeWidth={3} />}
 {h.action === 'SUBMITTED' && <Send size={10} strokeWidth={3} />}
 </div>

 <div className="flex-1 pb-1">
 <div className="flex justify-between items-start">
 <span className={`text-xs font-bold ${h.action === 'APPROVED' ? 'text-green-700' :
 h.action === 'REJECTED' ? 'text-red-700' :
 'text-blue-700'
 }`}>{h.action === 'APPROVED' ? 'ĐÃ DUYỆT' :
 h.action === 'REJECTED' ? 'TỪ CHỐI' :
 h.action === 'SUBMITTED' ? 'ĐÃ NỘP' : h.action}</span>
 <span className="text-[10px] text-gray-400">{new Date(h.createdAt).toLocaleString('vi-VN')}</span>
 </div>

 {h.description && (
 <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{h.description}</p>
 )}

 {h.evidenceUrl && h.action === 'SUBMITTED' && (
 <a href={h.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-500 hover:underline mt-1 bg-blue-50 px-2 py-1 rounded">
 <ExternalLink size={10} className="mr-1" /> Xem Liên Kết Bài Nộp
 </a>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Add Milestone Modal */}
 {showAddMilestone && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-lg p-6 w-full max-w-md">
 <h3 className="text-lg font-bold mb-4">Thêm Cột Mốc Mới</h3>
 <div className="space-y-3">
 <div>
 <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
 <input
 type="text"
 className="w-full mt-1 px-3 py-2 border rounded-md"
 value={newMilestone.title}
 onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700">Mô tả</label>
 <textarea
 className="w-full mt-1 px-3 py-2 border rounded-md"
 value={newMilestone.description}
 onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700">Hạn chót</label>
 <input
 type="datetime-local"
 className="w-full mt-1 px-3 py-2 border rounded-md"
 value={newMilestone.deadline}
 onChange={e => setNewMilestone({ ...newMilestone, deadline: e.target.value })}
 />
 </div>
 </div>
 <div className="flex justify-end gap-2 mt-6">
 <button onClick={() => setShowAddMilestone(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy bỏ</button>
 <button onClick={handleAddMilestone} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo</button>
 </div>
 </div>
 </div>
 )}

 {/* Reject Modal */}
 {rejectingId && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-lg p-6 w-full max-w-md">
 <h3 className="text-lg font-bold mb-4 text-red-600">Từ Chối Bài Nộp</h3>
 <p className="text-sm text-gray-600 mb-3">Vui lòng cung cấp phản hồi để Influencer biết cần cải thiện điều gì.</p>
 <textarea
 className="w-full h-32 px-3 py-2 border rounded-md resize-none -red-500 focus:border-red-500"
 placeholder="Nhập chi tiết phản hồi tại đây..."
 value={rejectFeedback}
 onChange={(e) => setRejectFeedback(e.target.value)}
 ></textarea>
 <div className="flex justify-end gap-2 mt-4">
 <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy bỏ</button>
 <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Xác Nhận Từ Chối</button>
 </div>
 </div>
 </div>
 )}

 {/* Complete Job Confirmation Modal */}
 {showCompleteModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-lg p-6 w-full max-w-md">
 <div className="flex items-center mb-4 text-amber-600">
 <AlertCircle size={24} className="mr-2" />
 <h3 className="text-lg font-bold">Hoàn Thành Hợp Đồng?</h3>
 </div>
 <p className="text-gray-600 mb-4">
 Bạn có chắc chắn muốn đánh dấu hợp đồng này là đã hoàn thành?
 <br /><br />
 <span className="font-medium text-gray-800">Hành động này sẽ:</span>
 <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
 <li>Giải ngân số tiền đang tạm giữ cho Influencer.</li>
 <li>Đóng hợp đồng này vĩnh viễn.</li>
 <li>Cho phép cả hai bên để lại đánh giá.</li>
 </ul>
 </p>
 <div className="flex justify-end gap-3 mt-6">
 <button
 onClick={() => setShowCompleteModal(false)}
 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
 >
 Hủy bỏ
 </button>
 <button
 onClick={confirmCompleteJob}
 className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
 >
 Xác Nhận Hoàn Thành
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Review Modal */}
 {reviewModal.isOpen && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-gray-900">Viết Đánh Giá</h2>
 <button onClick={() => setReviewModal({ isOpen: false, receiverId: null })} className="text-gray-400 hover:text-gray-600">
 <XCircle size={24} />
 </button>
 </div>

 <div className="flex flex-col items-center mb-6">
 <p className="text-sm text-gray-600 mb-2 font-medium">Trải nghiệm làm việc với đối tác này như thế nào?</p>
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
 Viết bình luận của bạn <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
 </label>
 <textarea
 className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-black outline-none"
 rows={4}
 placeholder="Giao tiếp, chất lượng công việc, thái độ..."
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
 Hủy bỏ
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

export default JobDetail;
