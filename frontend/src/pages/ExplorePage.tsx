import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Plus, X, Image as ImageIcon, Edit2, Search, Briefcase, Clock, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import CustomSelect from '../components/ui/CustomSelect';

interface Category {
 id: number;
 name: string;
 imageUrl: string;
}

const ExplorePage = () => {
 const { user, isAuthenticated } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();
 const [categories, setCategories] = useState<Category[]>([]);
 const [loading, setLoading] = useState(true);

 const [campaigns, setCampaigns] = useState<any[]>([]);
 const [loadingCampaigns, setLoadingCampaigns] = useState(true);
 const [search, setSearch] = useState('');
 const [platform, setPlatform] = useState('All');

 const [influencers, setInfluencers] = useState<any[]>([]);
 const [loadingInfluencers, setLoadingInfluencers] = useState(false);
 const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
 const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [newItemName, setNewItemName] = useState('');
 const [selectedImage, setSelectedImage] = useState<File | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [editingCategory, setEditingCategory] = useState<Category | null>(null);
 const [editItemName, setEditItemName] = useState('');
 const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);

 const isAdmin = user?.role?.name === 'ADMIN';
 const isCreator = user?.role?.name === 'CREATOR' || isAdmin;

 const fetchCategories = async () => {
 setLoading(true);
 try {
 const response = await api.get('/categories');
 setCategories(response.data);
 } catch (error) {
 console.error('Failed to fetch categories:', error);
 showToast('Lỗi tải dữ liệu', 'error');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchCategories();
 }, []);

 useEffect(() => {
 const fetchCampaigns = async () => {
 setLoadingCampaigns(true);
 try {
 const response = await api.get('/campaign/public', {
 params: {
 page: 0,
 size: 20,
 search: search,
 platform: platform === 'All' ? '' : platform
 }
 });
 setCampaigns(response.data.content);
 } catch (error) {
 console.error("Failed to fetch campaigns", error);
 } finally {
 setLoadingCampaigns(false);
 }
 };

 const fetchInfluencers = async () => {
 setLoadingInfluencers(true);
 try {
 const response = await api.get('/users/public/influencers', {
 params: {
 categoryName: selectedCategoryName || '',
 page: 0,
 size: 20,
 sortDirection
 }
 });
 setInfluencers(response.data.content);
 } catch (error) {
 console.error("Failed to fetch influencers", error);
 } finally {
 setLoadingInfluencers(false);
 }
 };

 const timer = setTimeout(() => {
 if (isCreator) {
 fetchInfluencers();
 }
 if (!isCreator || isAdmin) {
 fetchCampaigns();
 }
 }, 300);
 return () => clearTimeout(timer);
 }, [search, platform, selectedCategoryName, sortDirection, isCreator, isAdmin]);

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedImage(e.target.files[0]);
 }
 };

 const handleAddItem = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newItemName.trim()) {
 showToast('Tên item không được để trống', 'error');
 return;
 }

 setIsSubmitting(true);
 try {
 let uploadedImageUrl = '';

 // Upload image if selected
 if (selectedImage) {
 const formData = new FormData();
 formData.append('file', selectedImage);
 const uploadRes = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 uploadedImageUrl = uploadRes.data.url;
 }

 // Create category
 await api.post('/categories', {
 name: newItemName,
 imageUrl: uploadedImageUrl
 });

 showToast('Thêm mục mới thành công!', 'success');
 setIsAddModalOpen(false);
 setNewItemName('');
 setSelectedImage(null);
 fetchCategories(); // Refresh list
 } catch (error: any) {
 console.error('Failed to add category:', error);
 showToast(error.response?.data || 'Có lỗi xảy ra', 'error');
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleEditClick = (e: React.MouseEvent, cat: Category) => {
 e.stopPropagation();
 setEditingCategory(cat);
 setEditItemName(cat.name);
 setEditSelectedImage(null);
 setIsEditModalOpen(true);
 };

 const handleUpdateItem = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editItemName.trim() || !editingCategory) {
 showToast('Tên item không được để trống', 'error');
 return;
 }

 setIsSubmitting(true);
 try {
 let uploadedImageUrl = editingCategory.imageUrl;

 // Upload new image if selected
 if (editSelectedImage) {
 const formData = new FormData();
 formData.append('file', editSelectedImage);
 const uploadRes = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 uploadedImageUrl = uploadRes.data.url;
 }

 // Update category
 await api.put(`/categories/${editingCategory.id}`, {
 name: editItemName,
 imageUrl: uploadedImageUrl
 });

 showToast('Cập nhật danh mục thành công!', 'success');
 setIsEditModalOpen(false);
 setEditingCategory(null);
 fetchCategories(); // Refresh list
 } catch (error: any) {
 console.error('Failed to update category:', error);
 showToast(error.response?.data || 'Có lỗi xảy ra', 'error');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="max-w-7xl mx-auto px-4 py-8 relative space-y-8 min-h-[50vh]">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Khám Phá</h1>
 <p className="text-sm text-gray-500">Khám phá các danh mục chiến dịch</p>
 </div>
 {isAdmin && (
 <button
 onClick={() => setIsAddModalOpen(true)}
 className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
 >
 <Plus size={18} className="mr-1" />
 Thêm Item
 </button>
 )}
 </div>

 {loading ? (
 <div className="flex justify-center p-12">
 <Loader2 className="animate-spin text-gray-400" size={32} />
 </div>
 ) : categories.length === 0 ? (
 <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
 Chưa có hạng mục nào.
 </div>
 ) : (
 <div className="flex flex-wrap gap-6 justify-center sm:justify-between w-full">
 {categories.map((cat) => (
 <div key={cat.id} className={`flex flex-col items-center group cursor-pointer w-[120px] relative ${isCreator && selectedCategoryName === cat.name ? 'border-b-2 border-indigo-600 rounded-xl bg-indigo-50 p-2' : ''}`} onClick={() => { 
     if (isCreator) { 
         setSelectedCategoryName(selectedCategoryName === cat.name ? null : cat.name); 
     } else { 
         setSearch(cat.name); 
     }
 }}>
 {isAdmin && (
 <button
 onClick={(e) => handleEditClick(e, cat)}
 className="absolute -top-1 -right-1 p-1.5 bg-white shadow-md rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
 title="Chỉnh sửa danh mục"
 >
 <Edit2 size={14} />
 </button>
 )}
 <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
 {cat.imageUrl ? (
 <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
 ) : (
 <ImageIcon size={32} className="text-gray-300" />
 )}
 </div>
 <span className="mt-3 text-sm font-medium text-gray-800 text-center leading-tight">
 {cat.name}
 </span>
 </div>
 ))}
 </div>
 )}

 <div className="mt-12">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-8 border-t border-gray-200">
 <h2 className="text-xl font-bold text-gray-900">{isCreator ? 'Influencers' : 'Chiến Dịch Mới Nhất'}</h2>
 {isCreator && (
 <div className="flex gap-2">
 <button
 onClick={() => setSortDirection('desc')}
 className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sortDirection === 'desc' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Cao nhất
 </button>
 <button
 onClick={() => setSortDirection('asc')}
 className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sortDirection === 'asc' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Thấp nhất
 </button>
 </div>
 )}
 {!isCreator && (
 <div className="flex gap-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
 <input
 type="text"
 placeholder="Tìm kiếm chiến dịch..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:border-black w-full md:w-64"
 />
 </div>
 <div className="w-full md:w-48">
 <CustomSelect
 options={[
 { value: 'All', label: 'Tất cả nền tảng' },
 { value: 'Instagram', label: 'Instagram' },
 { value: 'TikTok', label: 'TikTok' },
 { value: 'YouTube', label: 'YouTube' },
 { value: 'Facebook', label: 'Facebook' }
 ]}
 value={platform}
 onChange={setPlatform}
 />
 </div>
 </div>
 )}
 </div>

 {isCreator ? (
 loadingInfluencers ? (
 <div className="flex justify-center p-12">
 <Loader2 className="animate-spin text-gray-400" size={32} />
 </div>
 ) : influencers.length === 0 ? (
 <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
 Chưa có KOL nào trong hạng mục này.
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
 {influencers.map((inf) => (
 <div key={inf.id} className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center p-6 text-center cursor-pointer" onClick={() => navigate(`/profile/${inf.id}`)}>
 <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-indigo-50 shadow-sm relative">
 {inf.avatarUrl ? <img src={inf.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><User size={32} className="text-gray-400"/></div>}
 {inf.isVerified && <div className="absolute bottom-0 right-0 bg-blue-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
 </div>
 <h3 className="font-bold text-gray-900 line-clamp-1">{inf.name}</h3>
 <div className="flex items-center text-yellow-500 mt-1 mb-2">
 {'★'.repeat(Math.round(inf.rating || 0))}<span className="text-gray-200">{'★'.repeat(5 - Math.round(inf.rating || 0))}</span>
 <span className="text-xs text-gray-500 ml-1 font-medium">{inf.rating ? inf.rating.toFixed(1) : 'Mới'}</span>
 </div>
 <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{inf.bio || 'Chưa có tiểu sử.'}</p>
 </div>
 ))}
 </div>
 )
 ) : (
 loadingCampaigns ? (
 <div className="flex justify-center p-12">
 <Loader2 className="animate-spin text-gray-400" size={32} />
 </div>
 ) : campaigns.length === 0 ? (
 <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
 Không tìm thấy chiến dịch nào phù hợp với tiêu chí của bạn.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {campaigns.map((campaign) => (
 <div key={campaign.id} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full cursor-pointer" onClick={() => {
     if (!isAuthenticated) {
         showToast('Vui lòng đăng nhập để xem chi tiết chiến dịch', 'error');
         navigate('/login');
         return;
     }
     navigate(`/creator/campaigns/${campaign.id}`);
 }}>
 {/* Image Cover */}
 <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
 {campaign.images && campaign.images.length > 0 ? (
 <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover" />
 ) : (
 <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
 <Briefcase size={32} />
 </div>
 )}
 <div className="absolute top-2 right-2">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-md">
 {campaign.layoutStyle || 'Standard'}
 </span>
 </div>
 </div>

 <div className="p-5 flex-1 flex flex-col">
 <div className="flex-1">
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{campaign.title}</h3>
 <p className="mt-1 text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
 </div>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {campaign.platforms && campaign.platforms.map((p: string) => (
 <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
 {p}
 </span>
 ))}
 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
 <Clock size={12} className="mr-1" />
 {new Date(campaign.deadline).toLocaleDateString()}
 </span>
 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${(campaign.approvedApplicantCount || 0) >= (campaign.targetApplicants || 1) ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
 Đã tuyển: {campaign.approvedApplicantCount || 0}/{campaign.targetApplicants || 1}
 </span>
 </div>
 </div>

 <div className="mt-6">
 <button
 onClick={(e) => { 
     e.stopPropagation(); 
     if (!isAuthenticated) {
         showToast('Vui lòng đăng nhập để xem chi tiết chiến dịch', 'error');
         navigate('/login');
         return;
     }
     navigate(`/creator/campaigns/${campaign.id}`); 
 }}
 className={`w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors ${(campaign.approvedApplicantCount || 0) >= (campaign.targetApplicants || 1) ? 'bg-gray-400 hover:bg-gray-500' : 'bg-black hover:bg-gray-800'}`}
 >
 {(campaign.approvedApplicantCount || 0) >= (campaign.targetApplicants || 1) ? 'Đã Đủ Người' : 'Xem Chi Tiết & Ứng Tuyển'}
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )
 )}
 </div>

 {/* Modal for Adding Item */}
 {isAddModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
 <button
 onClick={() => setIsAddModalOpen(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
 >
 <X size={20} />
 </button>

 <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm Danh Mục Mới</h3>

 <form onSubmit={handleAddItem} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tên Item</label>
 <input
 type="text"
 required
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 placeholder="Vd: Làm đẹp, Giải trí..."
 value={newItemName}
 onChange={(e) => setNewItemName(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Tùy chọn)</label>
 <div className="mt-1 flex items-center gap-4">
 <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
 {selectedImage ? (
 <img src={URL.createObjectURL(selectedImage)} alt="preview" className="h-full w-full object-cover" />
 ) : (
 <ImageIcon size={20} className="text-gray-400" />
 )}
 </div>
 <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
 <span>Chọn ảnh</span>
 <input
 type="file"
 className="hidden"
 accept="image/*"
 onChange={handleImageChange}
 />
 </label>
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
 >
 {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Tạo mới'}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Modal for Editing Item */}
 {isEditModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
 <button
 onClick={() => setIsEditModalOpen(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
 >
 <X size={20} />
 </button>

 <h3 className="text-lg font-bold text-gray-900 mb-4">Cập Nhật Danh Mục</h3>

 <form onSubmit={handleUpdateItem} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tên Item</label>
 <input
 type="text"
 required
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 placeholder="Vd: Làm đẹp, Giải trí..."
 value={editItemName}
 onChange={(e) => setEditItemName(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện mới (Tùy chọn)</label>
 <div className="mt-1 flex items-center gap-4">
 <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 overflow-hidden relative group">
 {editSelectedImage ? (
 <img src={URL.createObjectURL(editSelectedImage)} alt="preview" className="h-full w-full object-cover" />
 ) : editingCategory?.imageUrl ? (
 <img src={editingCategory.imageUrl} alt="current" className="h-full w-full object-cover" />
 ) : (
 <ImageIcon size={20} className="text-gray-400" />
 )}
 </div>
 <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex flex-col items-center">
 <span>Đổi ảnh</span>
 <input
 type="file"
 className="hidden"
 accept="image/*"
 onChange={(e) => {
 if (e.target.files && e.target.files.length > 0) {
 setEditSelectedImage(e.target.files[0]);
 }
 }}
 />
 </label>
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
 >
 {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Lưu Thay Đổi'}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};

export default ExplorePage;
