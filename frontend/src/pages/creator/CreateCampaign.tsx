import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Upload, Calendar, Hash, Monitor, X, Image as ImageIcon, Video, Loader2, Layout, CheckCircle, Eye, Edit2 } from 'lucide-react';
import { ClassicLayout, ShowcaseLayout, SocialLayout, MinimalLayout } from '../../components/layouts/CampaignLayouts';
import { useAuth } from '../../context/AuthContext';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

interface FormDataType {
  title: string;
  description: string;
  images: string[];
  videos: string[];
  deadline: string;
  tags: string[];
  platforms: string[];
  layoutStyle: string;
  status: string;
  budget: number;
  targetApplicants: number;
}

const CreateCampaign = () => {
 const { id } = useParams(); // Get campaign ID if in edit mode
 const navigate = useNavigate();
  // const location = useLocation();
 const { user } = useAuth();
  const [formData, setFormData] = useState<FormDataType>(() => {
 if (!id) {
 const draft = sessionStorage.getItem('campaignDraft');
 if (draft) {
 try {
 return JSON.parse(draft);
 } catch(e) {}
 }
 }
 return {
 title: '',
 description: '',
 images: [] as string[],
 videos: [] as string[],
 deadline: '',
 tags: [] as string[],
 platforms: [] as string[],
 layoutStyle: 'CLASSIC', // Default
 status: 'Đang tuyển',
 budget: 0,
 targetApplicants: 1
 };
 });

 useEffect(() => {
 if (!id) {
 sessionStorage.setItem('campaignDraft', JSON.stringify(formData));
 }
 }, [formData, id]);
 const [loading, setLoading] = useState(false);
 const isSubmittingRef = useRef(false);
 // const [fetching, setFetching] = useState(false); // For initial data fetch
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState('');
 const [mediaError, setMediaError] = useState('');
 const [isPreview, setIsPreview] = useState(false);
 const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

 useEffect(() => {
 api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
 }, []);

 useEffect(() => {
 if (id) {
 api.get(`/campaign/${id}`)
 .then(response => {
 const data = response.data;
 setFormData({
 title: data.title || '',
 description: data.description || '',
 images: data.images || [],
 videos: data.videos || [],
 deadline: data.deadline ? data.deadline.split('T')[0] : '',
 tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []),
 platforms: data.platforms || [],
 layoutStyle: data.layoutStyle || 'CLASSIC',
 status: data.status || 'Đang tuyển',
 budget: data.budget || 0,
 targetApplicants: data.targetApplicants || 1
 });
 })
 .catch(err => {
 console.error("Failed to fetch campaign details", err);
 setError("Failed to load campaign data.");
 });
 }
 }, [id]);

 const imageInputRef = useRef<HTMLInputElement>(null);
 const videoInputRef = useRef<HTMLInputElement>(null);
 const errorRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (error && errorRef.current) {
 errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 }, [error]);

 const layouts = [
 { id: 'CLASSIC', name: 'Tiêu chuẩn', description: 'Giao diện truyền thống chia đôi. Tốt nhất cho các mô tả văn bản chi tiết với một bộ sưu tập ảnh bên cạnh.', color: 'bg-gray-100' },
 { id: 'SHOWCASE', name: 'Trưng bày hình ảnh', description: 'Trải nghiệm đắm chìm. Tính năng banner ảnh toàn màn hình và lưới ảnh rộng. Hoàn hảo cho hình ảnh chất lượng cao.', color: 'bg-indigo-50' },
 { id: 'SOCIAL', name: 'Ưu tiên mạng xã hội', description: 'Phong cách ứng dụng di động. Làm nổi bật các nền tảng (TikTok, IG). Tuyệt vời cho các chiến dịch tập trung vào influencer.', color: 'bg-pink-50' },
 { id: 'MINIMAL', name: 'Tối giản', description: 'Gọn gàng và mang tính xã luận. Chỉ tập trung vào typography và nút "Ứng tuyển". Hình ảnh hiển thị thang độ xám một cách tinh tế cho đến khi di chuột.', color: 'bg-white border' }
 ];

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const rawValue = e.target.value.replace(/\D/g, '');
 setFormData({ ...formData, budget: parseInt(rawValue || '0', 10) });
 };

 const handlePlatformChange = (platform: string) => {
 setFormData(prev => {
 if (prev.platforms.includes(platform)) {
 return { ...prev, platforms: prev.platforms.filter(p => p !== platform) };
 } else {
 return { ...prev, platforms: [...prev.platforms, platform] };
 }
 });
 };

 const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
 if (!files || files.length === 0) return;

 setUploading(true);
 setMediaError('');

 try {
 const uploadedUrls: string[] = [];
 for (let i = 0; i < files.length; i++) {
 const file = files[i];
 const formData = new FormData();
 formData.append('file', file);

 const response = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 uploadedUrls.push(response.data.url);
 }

 setFormData(prev => ({
 ...prev,
 [type === 'image' ? 'images' : 'videos']: [
 ...prev[type === 'image' ? 'images' : 'videos'],
 ...uploadedUrls
 ]
 }));

 } catch (err) {
 console.error(err);
 setMediaError('Tải tập tin thất bại. Vui lòng kiểm tra lại kết nối mạng hoặc dung lượng file.');
 } finally {
 setUploading(false);
 if (imageInputRef.current) imageInputRef.current.value = '';
 if (videoInputRef.current) videoInputRef.current.value = '';
 }
 };

 const removeMedia = (url: string, type: 'image' | 'video') => {
 setFormData(prev => ({
 ...prev,
 [type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].filter(item => item !== url)
 }));
 };

 const handleDescriptionChange = useCallback((value: string) => {
 setFormData(prev => ({ ...prev, description: value }));
 }, []);

 const mdeOptions = useMemo(() => {
 return {
 placeholder: "Mô tả về thương hiệu của bạn, mục tiêu chiến dịch và những gì bạn mong đợi từ influencer... (Hỗ trợ Markdown)",
 spellChecker: false,
 status: false,
 minHeight: "150px",
 toolbar: [
 "bold", "italic", "heading", "|",
 "quote", "unordered-list", "ordered-list", "|",
 "link", "image", "|",
 "preview", "guide"
 ]
 } as any;
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (isSubmittingRef.current) return;
 isSubmittingRef.current = true;
 setLoading(true);
 setError('');

 try {
 const payload = {
 title: formData.title,
 description: formData.description,
 images: formData.images,
 videos: formData.videos,
 deadline: formData.deadline,
 tags: formData.tags,
 platforms: formData.platforms,
 layoutStyle: formData.layoutStyle,
 status: formData.status,
 budget: formData.budget,
 targetApplicants: formData.targetApplicants
 };

 if (id) {
 // Update existing campaign
 await api.put(`/campaign/${id}`, payload);
 } else {
 // Create new
 await api.post('/campaign/create', payload);
 }
 sessionStorage.removeItem('campaignDraft');
 navigate('/creator/dashboard');
 } catch (err: any) {
 console.error(err);
 let errorMessage = id ? 'Cập nhật chiến dịch thất bại.' : 'Tạo chiến dịch thất bại. Vui lòng thử lại.';
 
 if (err.response && err.response.data) {
 // The backend sometimes returns a simple string message, or a JSON object with a message field
 if (typeof err.response.data === 'string') {
 errorMessage = err.response.data;
 } else if (err.response.data.message) {
 errorMessage = err.response.data.message;
 }
 }
 
 setError(errorMessage);
 } finally {
 isSubmittingRef.current = false;
 setLoading(false);
 }
 };

 // Helper to render current layout preview
 const renderPreview = () => {
 const previewData = { ...formData, creator: { name: user?.name || 'You', email: user?.email || 'email@example.com' } };
 switch (formData.layoutStyle) {
 case 'SHOWCASE': return <ShowcaseLayout data={previewData} />;
 case 'SOCIAL': return <SocialLayout data={previewData} />;
 case 'MINIMAL': return <MinimalLayout data={previewData} />;
 default: return <ClassicLayout data={previewData} />;
 }
 };

 if (isPreview) {
 return (
 <div className="bg-gray-100 min-h-screen pb-20">
 <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
 <h2 className="text-lg font-semibold flex items-center gap-2">
 <Eye size={20} className="text-indigo-600" /> Xem Trước Trực Tiếp: <span className="text-indigo-600">{layouts.find(l => l.id === formData.layoutStyle)?.name}</span>
 </h2>
 <div className="flex gap-3">
 <button
 onClick={() => setIsPreview(false)}
 className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-50 transition-colors"
 >
 <Edit2 size={16} /> Tiếp Tục Chỉnh Sửa
 </button>
 <button
 onClick={handleSubmit}
 disabled={loading}
 className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
 >
 {loading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
 Xuất Bản Ngay
 </button>
 </div>
 </div>
 {renderPreview()}
 </div>
 );
 }

 const isDeadlineInPast = formData.deadline 
 ? new Date(formData.deadline) < new Date(new Date().setHours(0,0,0,0)) 
 : false;

 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex justify-between items-center mb-6">
 <button
 onClick={() => navigate(-1)}
 className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
 >
 <ChevronLeft size={20} />
 <span className="ml-1">Quay lại</span>
 </button>
 <button
 onClick={() => setIsPreview(true)}
 className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
 >
 <Eye size={18} /> Xem Trước Giao Diện
 </button>
 </div>

 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
 <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
 <div>
 <h1 className="text-xl font-bold text-gray-900">{id ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Mới'}</h1>
 <p className="text-gray-500 text-sm mt-1 mb-1">Thiết kế một chiến dịch đẹp mắt để thu hút các influencer hàng đầu.</p>
 <p className="text-red-500 text-xs font-semibold">* Lưu ý: Sẽ mất 10% phí hoa hồng cho nền tảng dựa trên ngân sách hợp đồng.</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="p-8 space-y-8">
 {/* Verification Overlay/Banner */}
 {user && !user.isVerified && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
 <h3 className="text-lg font-bold text-red-800 mb-2">Yêu Cầu Xác Minh Danh Tính</h3>
 <p className="text-sm text-red-700 mb-4">
 Để đảm bảo môi trường an toàn và minh bạch, bạn cần phải xác minh danh tính tài khoản trước khi đăng tải chiến dịch thuê Influencer.
 </p>
  <button 
  type="button"
  onClick={() => navigate('/verification')}
  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
  >
  Đi đến Trang Xác Minh
  </button>
 </div>
 )}


 {/* Section 0: Layout Selection */}
 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
 <Layout size={20} /> Chọn Kiểu Giao Diện
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {layouts.map(layout => (
 <div
 key={layout.id}
 onClick={() => setFormData({ ...formData, layoutStyle: layout.id })}
 className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${formData.layoutStyle === layout.id
 ? 'border-black bg-gray-50 ring-1 ring-black'
 : 'border-gray-200 hover:border-gray-300'
 }`}
 >
 {formData.layoutStyle === layout.id && (
 <div className="absolute top-2 right-2 text-black">
 <CheckCircle size={18} fill="black" className="text-white" />
 </div>
 )}
 <div className={`h-20 w-full rounded-md mb-3 ${layout.color}`}></div>
 <h3 className="font-semibold text-gray-900 text-sm">{layout.name}</h3>
 <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="border-t border-gray-100 pt-8 space-y-6">
 <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Chi Tiết Cơ Bản</h2>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu Đề Chiến Dịch</label>
 <input
 type="text"
 name="title"
 required
 value={formData.title}
 onChange={handleInputChange}
 className="w-full px-4 py-3 border border-gray-200 rounded-lg -black focus:border-black outline-none transition-all text-lg placeholder-gray-400"
 placeholder="VD: Ra mắt bộ chăm sóc da mùa hè"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Số Lượng Influencer Cần Tuyển</label>
 <input
 type="number"
 name="targetApplicants"
 required
 min="1"
 disabled={!!id}
 value={formData.targetApplicants}
 onChange={(e) => setFormData({ ...formData, targetApplicants: parseInt(e.target.value) || 1 })}
 className="w-full px-4 py-3 border border-gray-200 rounded-lg -black focus:border-black outline-none transition-all text-lg placeholder-gray-400 disabled:bg-gray-100"
 placeholder="VD: 5"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Chi Phí Cơ Bản cho 1 Influencer</label>
 <div className="relative">
 <input
 type="text"
 name="budget"
 required
 disabled={!!id}
 value={formData.budget === 0 ? '' : formData.budget.toLocaleString('vi-VN')}
 onChange={handleBudgetChange}
 className="w-full px-4 py-3 border border-gray-200 rounded-lg -black focus:border-black outline-none transition-all text-lg placeholder-gray-400 disabled:bg-gray-100"
 placeholder="VD: 5.000.000"
 />
 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
 <span className="text-gray-500 font-medium">VNĐ</span>
 </div>
 </div>
 </div>
 </div>

 {/* Escrow summary calculation */}
 {!id && formData.budget > 0 && formData.targetApplicants > 0 && (
 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
 <div>
 <h4 className="font-semibold text-indigo-900 mb-1">Dự toán Tạm Giữ (Escrow)</h4>
 <p className="text-xs text-indigo-700 max-w-md">
 Hệ thống sẽ tạm giữ số dư trong ví để đảm bảo khả năng thanh toán. Số tiền rảnh rỗi sẽ được hoàn nguyên nếu hủy chiến dịch hoặc không tuyển đủ người.
 </p>
 </div>
 <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm text-right shrink-0 min-w-[280px]">
 <div className="flex justify-between items-center text-sm text-gray-600 mb-2 gap-6">
 <span>Chi phí nhân sự ({formData.targetApplicants}):</span>
 <span className="font-medium">{(formData.budget * formData.targetApplicants).toLocaleString('vi-VN')} ₫</span>
 </div>
 <div className="flex justify-between items-center text-sm text-gray-600 mb-3 gap-6">
 <span>Phí nền tảng (10%):</span>
 <span className="font-medium">{((formData.budget * formData.targetApplicants * 0.1)).toLocaleString('vi-VN')} ₫</span>
 </div>
 <div className="flex justify-between items-center font-bold text-lg text-indigo-700 pt-3 border-t border-dashed border-gray-200 gap-6">
 <span>Tổng yêu cầu:</span>
 <span>{((formData.budget * formData.targetApplicants * 1.1)).toLocaleString('vi-VN')} ₫</span>
 </div>
 </div>
 </div>
 )}
 {!!id && (
 <p className="text-xs text-gray-500 mt-2 italic bg-gray-50 p-2 rounded border border-gray-100">
 * Ngân sách và số lượng ứng viên mục tiêu được khóa lại bảo mật sau khi chiến dịch đã được khởi chạy.
 </p>
 )}

 {error && (
 <div ref={errorRef} className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
 <div className="flex items-center">
 <span className="mr-2">⚠️</span> {error.replace(/\b(\d{4,})\b/g, (match) => parseInt(match, 10).toLocaleString('vi-VN'))}
 </div>
 {error.includes('Số dư ví không đủ') && (
 <button type="button" onClick={() => {
 let depositAmount = 100000;
 try {
 const parts = error.split('tổng tạm giữ:');
 if (parts.length > 1) {
 const rawAmount = parts[1].replace(/[^\d]/g, '');
 if (rawAmount) depositAmount = parseInt(rawAmount, 10);
 }
 } catch(e) {}
 navigate('/wallet', { state: { autoDepositAmount: depositAmount, returnTo: location.pathname } });
 }} className="whitespace-nowrap px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors w-fit">
 Nạp Thêm Tiền
 </button>
 )}
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
 <div className="prose-sm sm:prose-base">
 <SimpleMdeReact
 value={formData.description}
 onChange={handleDescriptionChange}
 options={mdeOptions}
 />
 </div>
 </div>
 </div>

 {/* Section 2: Media Gallery */}
 <div className="space-y-6">
 <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex justify-between items-center">
 <span>Thư Viện Phương Tiện</span>
 {uploading && <span className="text-sm font-normal text-indigo-600 flex items-center"><Loader2 className="animate-spin mr-1" size={16} /> Đang tải lên...</span>}
 </h2>

 {mediaError && (
 <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center">
 <span className="mr-2">⚠️</span> {mediaError}
 </div>
 )}

 {/* Images Upload */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Hình Ảnh Chiến Dịch</label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
 {formData.images.map((url, idx) => (
 <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
 <img src={url} alt={`Campaign ${idx}`} className="w-full h-full object-cover" />
 <button
 type="button"
 onClick={() => removeMedia(url, 'image')}
 className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
 >
 <X size={16} />
 </button>
 </div>
 ))}
 <div
 onClick={() => imageInputRef.current?.click()}
 className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600"
 >
 <ImageIcon size={32} strokeWidth={1.5} />
 <span className="text-xs mt-2 font-medium">Thêm Ảnh</span>
 </div>
 </div>
 <input
 type="file"
 ref={imageInputRef}
 className="hidden"
 accept="image/*"
 multiple
 onChange={(e) => handleFileUpload(e.target.files, 'image')}
 />
 <p className="text-xs text-gray-500">Định dạng hỗ trợ: JPG, PNG, WEBP. Tối đa 5MB mỗi tệp.</p>
 </div>

 {/* Video Upload */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Video Quảng Cáo (Không Bắt Buộc)</label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 {formData.videos.map((url, idx) => (
 <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black">
 <video src={url} className="w-full h-full object-cover" controls />
 <button
 type="button"
 onClick={() => removeMedia(url, 'video')}
 className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
 >
 <X size={16} />
 </button>
 </div>
 ))}
 {formData.videos.length === 0 && (
 <div
 onClick={() => videoInputRef.current?.click()}
 className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600"
 >
 <Video size={32} strokeWidth={1.5} />
 <span className="text-xs mt-2 font-medium">Thêm Video</span>
 </div>
 )}
 </div>
 <input
 type="file"
 ref={videoInputRef}
 className="hidden"
 accept="video/*"
 onChange={(e) => handleFileUpload(e.target.files, 'video')}
 />
 <p className="text-xs text-gray-500">Định dạng hỗ trợ: MP4, MOV. Tối đa 50MB.</p>
 </div>
 </div>

 {/* Section 3: Targeting & Logistics */}
 <div className="space-y-6">
 <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Mục Tiêu & Hậu Cần</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 <span className="flex items-center gap-2"><Calendar size={18} className="text-gray-400" /> Hạn Chót Ứng Tuyển</span>
 </label>
 <input
 type="date"
 name="deadline"
 required
 value={formData.deadline}
 onChange={handleInputChange}
 className={`w-full px-4 py-3 border rounded-lg -black focus:border-black outline-none transition-all ${isDeadlineInPast ? 'border-red-500 bg-red-50 -red-500 focus:border-red-500' : 'border-gray-200'}`}
 />
 {isDeadlineInPast && <p className="text-red-500 text-xs mt-2 italic font-medium">* Hạn chót không được trễ hơn hiện tại (thời gian quá khứ).</p>}
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 <span className="flex items-center gap-2"><Hash size={18} className="text-gray-400" /> Danh Mục / Thẻ</span>
 </label>
 <div className="flex flex-wrap gap-2">
 {categories.map(cat => {
 const isSelected = formData.tags.includes(cat.name);
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => {
 setFormData(prev => ({
 ...prev,
 tags: isSelected
 ? prev.tags.filter(t => t !== cat.name)
 : [...prev.tags, cat.name]
 }));
 }}
 className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
 >
 {cat.name}
 </button>
 );
 })}
 {categories.length === 0 && <span className="text-sm text-gray-500 italic">Chưa có danh mục nào (Tạo tại mục Explore)</span>}
 </div>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-3">
 <span className="flex items-center gap-2"><Monitor size={18} className="text-gray-400" /> Nền Tảng Yêu Cầu</span>
 </label>
 <div className="flex flex-wrap gap-3">
 {['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter'].map(platform => (
 <button
 key={platform}
 type="button"
 onClick={() => handlePlatformChange(platform)}
 className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${formData.platforms.includes(platform)
 ? 'bg-black text-white border-black shadow-md transform -translate-y-0.5'
 : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
 }`}
 >
 {platform}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Submit Actions */}
 <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
 <button
 type="button"
 onClick={() => navigate(-1)}
 className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
 >
 Hủy
 </button>
 <button
 type="submit"
 disabled={loading || uploading || !!(user && !user.isVerified) || isDeadlineInPast}
 className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
 {loading ? (id ? 'Đang cập nhật...' : 'Đang tạo chiến dịch...') : (id ? 'Cập Nhật Chiến Dịch' : 'Đăng Chiến Dịch')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default CreateCampaign;
