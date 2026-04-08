import { Users, ShoppingBag, DollarSign, Activity, ShieldCheck, Check, X, ExternalLink, Loader2, UserX, UserCheck, Edit2, Trash2, Plus, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

interface VerificationRequest {
 id: number;
 user: {
 id: number;
 name: string;
 email: string;
 role: { name: string };
 };
 documentType: string;
 documentUrl: string;
 status: string;
 createdAt: string;
}

const getVietQRBankName = (name: string): string => {
 if (!name) return "";
 const lower = name.toLowerCase();
 if (lower.includes("vietcom") || lower.includes("vcb")) return "VCB";
 if (lower.includes("techcom") || lower.includes("tcb")) return "TCB";
 if (lower.includes("mb") || lower.includes("quân đội")) return "MB";
 if (lower.includes("agri") || lower.includes("vba")) return "VBA";
 if (lower.includes("vietin") || lower.includes("ctg")) return "CTG";
 if (lower.includes("bidv")) return "BIDV";
 if (lower.includes("vp")) return "VPB";
 if (lower.includes("tp")) return "TPB";
 if (lower.includes("vib")) return "VIB";
 if (lower.includes("acb")) return "ACB";
 if (lower.includes("saco") || lower.includes("stb")) return "STB";
 if (lower.includes("shb")) return "SHB";
 if (lower.includes("ocean") || lower.includes("ocb")) return "OCB";
 if (lower.includes("sea") || lower.includes("ssb")) return "SeABank";
 if (lower.includes("hdb")) return "HDB";
 return name.replace(/\s+/g, '');
};

const AdminDashboard = () => {
 // Utility for Vietnamese accent removal in search
 const removeAccents = (str: string) => {
 return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D') : '';
 };

 const [activeTab, setActiveTab] = useState('overview');
 const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
 const [loadingVerifications, setLoadingVerifications] = useState(false);
 const [processingId, setProcessingId] = useState<number | null>(null);

 const [withdrawals, setWithdrawals] = useState<any[]>([]);
 const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
 const [supportTickets, setSupportTickets] = useState<any[]>([]);
 const [loadingSupport, setLoadingSupport] = useState(false);
 const [transferQRModalData, setTransferQRModalData] = useState<any | null>(null);

 const [stats, setStats] = useState<any>({ totalUsers: 0, activeCampaigns: 0, totalRevenue: 0, totalCommission: 0 });
 const [users, setUsers] = useState<any[]>([]);
 const [campaigns, setCampaigns] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);

 // Chart States
 const [chartMode, setChartMode] = useState('7days'); // 7days, 30days, thisMonth, thisYear, custom
 const [customStartDate, setCustomStartDate] = useState('');
 const [customEndDate, setCustomEndDate] = useState('');
 const [chartData, setChartData] = useState<any[]>([]);

 const [isUserModalOpen, setIsUserModalOpen] = useState(false);
 const [editingUser, setEditingUser] = useState<any>(null);
 const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
 const [userFormSubmitting, setUserFormSubmitting] = useState(false);

 const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
 const [editingCampaign, setEditingCampaign] = useState<any>(null);
 const [campaignFormData, setCampaignFormData] = useState({ title: '', description: '', status: 'Active' });
 const [campaignFormSubmitting, setCampaignFormSubmitting] = useState(false);

 const [banners, setBanners] = useState<any[]>([]);
 const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
 const [editingBanner, setEditingBanner] = useState<any>(null);
 const [bannerFormData, setBannerFormData] = useState({ imageUrl: '', videoUrl: '', type: 'IMAGE', targetUrl: '', displayOrder: 0, isActive: true });
 const [bannerFormSubmitting, setBannerFormSubmitting] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);

 // Filter & Search States
 const [userSearchText, setUserSearchText] = useState('');
 const [userRoleFilter, setUserRoleFilter] = useState('ALL');
 const [campaignSearchText, setCampaignSearchText] = useState('');
 const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');
 const [campaignBrandFilter, setCampaignBrandFilter] = useState('ALL');
 const [bannerTypeFilter, setBannerTypeFilter] = useState('ALL');
 const [bannerStatusFilter, setBannerStatusFilter] = useState('ALL');
 const [verificationSearchText, setVerificationSearchText] = useState('');
 const [verificationStatusFilter, setVerificationStatusFilter] = useState('PENDING');

 useEffect(() => {
 if (activeTab === 'overview') {
 if (chartMode !== 'custom' || (customStartDate && customEndDate)) {
 fetchChartData();
 }
 }
 }, [chartMode, customStartDate, customEndDate, activeTab]);

 useEffect(() => {
 if (activeTab === 'verifications') {
 fetchVerificationRequests();
 } else if (activeTab === 'overview') {
 fetchStats();
 // fetchChartData() is handled by the other useEffect
 } else if (activeTab === 'users') {
 fetchUsers();
 } else if (activeTab === 'campaigns') {
 fetchCampaigns();
 } else if (activeTab === 'banners') {
 fetchBanners();
 } else if (activeTab === 'withdrawals') {
 fetchWithdrawals();
 } else if (activeTab === 'support') {
 fetchSupportTickets();
 }
 }, [activeTab]);

 const fetchVerificationRequests = async () => {
 setLoadingVerifications(true);
 try {
 const response = await api.get('/verification/pending');
 setVerificationRequests(response.data);
 } catch (error) {
 console.error("Failed to fetch requests", error);
 } finally {
 setLoadingVerifications(false);
 }
 };

 const fetchWithdrawals = async () => {
 setLoadingWithdrawals(true);
 try {
 const response = await api.get('/admin/withdrawals');
 setWithdrawals(response.data);
 } catch (error) {
 console.error("Failed to fetch withdrawals", error);
 } finally {
 setLoadingWithdrawals(false);
 }
 };

 const fetchSupportTickets = async () => {
 setLoadingSupport(true);
 try {
 const response = await api.get('/support-tickets');
 setSupportTickets(response.data.content || response.data);
 } catch (error) {
 console.error("Failed to fetch support tickets", error);
 } finally {
 setLoadingSupport(false);
 }
 };

 const handleResolveTicket = async (id: number) => {
 setProcessingId(id);
 try {
 await api.put(`/support-tickets/${id}/resolve`);
 setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
 } catch (error) {
 console.error("Failed to resolve ticket", error);
 } finally {
 setProcessingId(null);
 }
 };

 const fetchStats = async () => {
 try {
 const res = await api.get('/admin/statistics');
 setStats(res.data);
 } catch (e) {
 console.error("Failed to fetch stats", e);
 }
 };

 const fetchChartData = async () => {
 try {
 let start = '';
 let end = '';
 const today = new Date();
 
 if (chartMode === '7days') {
 const date = new Date();
 date.setDate(today.getDate() - 6);
 start = date.toISOString().split('T')[0];
 end = today.toISOString().split('T')[0];
 } else if (chartMode === '30days') {
 const date = new Date();
 date.setDate(today.getDate() - 29);
 start = date.toISOString().split('T')[0];
 end = today.toISOString().split('T')[0];
 } else if (chartMode === 'thisMonth') {
 const date = new Date(today.getFullYear(), today.getMonth(), 1);
 start = date.toISOString().split('T')[0];
 end = today.toISOString().split('T')[0];
 } else if (chartMode === 'thisYear') {
 const date = new Date(today.getFullYear(), 0, 1);
 start = date.toISOString().split('T')[0];
 end = today.toISOString().split('T')[0];
 } else if (chartMode === 'custom') {
 start = customStartDate;
 end = customEndDate;
 if (!start || !end) return; 
 }
 
 const res = await api.get(`/admin/charts?startDate=${start}&endDate=${end}`);
 setChartData(res.data);
 } catch (e) {
 console.error("Failed to fetch chart data", e);
 }
 };

 const fetchUsers = async () => {
 setLoading(true);
 try {
 const res = await api.get('/admin/users');
 setUsers(res.data);
 } catch (e) {
 console.error("Failed to fetch users", e);
 } finally {
 setLoading(false);
 }
 };

 const fetchCampaigns = async () => {
 setLoading(true);
 try {
 const res = await api.get('/admin/campaigns');
 setCampaigns(res.data);
 } catch (e) {
 console.error("Failed to fetch campaigns", e);
 } finally {
 setLoading(false);
 }
 };

 const fetchBanners = async () => {
 setLoading(true);
 try {
 const res = await api.get('/admin/banners');
 setBanners(res.data);
 } catch (e) {
 console.error("Failed to fetch banners", e);
 } finally {
 setLoading(false);
 }
 };

 const handleUserStatusToggle = async (id: number, currentStatus: boolean) => {
 try {
 await api.put(`/admin/users/${id}/status`, { enabled: !currentStatus });
 fetchUsers();
 } catch (e) {
 console.error("Failed to update status", e);
 }
 };

 const openAddUserModal = () => {
 setEditingUser(null);
 setUserFormData({ name: '', email: '', password: '', role: 'USER' });
 setIsUserModalOpen(true);
 };

 const openEditUserModal = (user: any) => {
 setEditingUser(user);
 setUserFormData({ name: user.name, email: user.email, password: '', role: user.role?.name || 'USER' });
 setIsUserModalOpen(true);
 };

 const handleUserSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setUserFormSubmitting(true);
 try {
 if (editingUser) {
 await api.put(`/admin/users/${editingUser.id}`, userFormData);
 } else {
 await api.post('/admin/users', userFormData);
 }
 setIsUserModalOpen(false);
 fetchUsers();
 } catch (error: any) {
 console.error("Failed to save user", error);
 alert(error.response?.data || "Có lỗi xảy ra");
 } finally {
 setUserFormSubmitting(false);
 }
 };

 const handleDeleteUser = async (id: number) => {
 if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
 try {
 await api.delete(`/admin/users/${id}`);
 fetchUsers();
 } catch (error) {
 console.error("Failed to delete user", error);
 }
 }
 };

 const openAddCampaignModal = () => {
 setEditingCampaign(null);
 setCampaignFormData({ title: '', description: '', status: 'Active' });
 setIsCampaignModalOpen(true);
 };

 const openEditCampaignModal = (campaign: any) => {
 setEditingCampaign(campaign);
 setCampaignFormData({ title: campaign.title, description: campaign.description || '', status: campaign.status || 'Active' });
 setIsCampaignModalOpen(true);
 };

 const handleCampaignSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setCampaignFormSubmitting(true);
 try {
 if (editingCampaign) {
 await api.put(`/admin/campaigns/${editingCampaign.id}`, campaignFormData);
 } else {
 await api.post('/admin/campaigns', campaignFormData);
 }
 setIsCampaignModalOpen(false);
 fetchCampaigns();
 } catch (error: any) {
 console.error("Failed to save campaign", error);
 alert("Có lỗi xảy ra: " + (error.response?.data || error.message));
 } finally {
 setCampaignFormSubmitting(false);
 }
 };

 const handleDeleteCampaign = async (id: number) => {
 if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) {
 try {
 await api.delete(`/admin/campaigns/${id}`);
 fetchCampaigns();
 } catch (error) {
 console.error("Failed to delete campaign", error);
 alert("Bạn không thể xoá chiến dịch này vì có dữ liệu liên quan. Vui lòng thử chuyển trạng thái thành 'Đóng'.");
 }
 }
 };

 const openAddBannerModal = () => {
 setEditingBanner(null);
 setBannerFormData({ imageUrl: '', videoUrl: '', type: 'IMAGE', targetUrl: '', displayOrder: 0, isActive: true });
 setIsBannerModalOpen(true);
 };

 const openEditBannerModal = (banner: any) => {
 setEditingBanner(banner);
 setBannerFormData({ imageUrl: banner.imageUrl || '', videoUrl: banner.videoUrl || '', type: banner.type || 'IMAGE', targetUrl: banner.targetUrl || '', displayOrder: banner.displayOrder, isActive: banner.isActive });
 setIsBannerModalOpen(true);
 };

 const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploadingImage(true);
 const formData = new FormData();
 formData.append('file', file);

 try {
 const res = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 setBannerFormData(prev => ({ ...prev, imageUrl: res.data.url }));
 } catch (error) {
 console.error("Failed to upload image", error);
 alert("Tải ảnh thất bại!");
 } finally {
 setUploadingImage(false);
 }
 };

 const handleBannerSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setBannerFormSubmitting(true);
 try {
 if (editingBanner) {
 await api.put(`/admin/banners/${editingBanner.id}`, bannerFormData);
 } else {
 await api.post('/admin/banners', bannerFormData);
 }
 setIsBannerModalOpen(false);
 fetchBanners();
 } catch (error: any) {
 console.error("Failed to save banner", error);
 alert("Có lỗi xảy ra: " + (error.response?.data || error.message));
 } finally {
 setBannerFormSubmitting(false);
 }
 };

 const handleDeleteBanner = async (id: number) => {
 if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
 try {
 await api.delete(`/admin/banners/${id}`);
 fetchBanners();
 } catch (error) {
 console.error("Failed to delete banner", error);
 }
 }
 };

 const handleApprove = async (id: number) => {
 setProcessingId(id);
 try {
 await api.post(`/verification/${id}/approve`);
 setVerificationRequests(prev => prev.filter(req => req.id !== id));
 } catch (error) {
 console.error("Failed to approve", error);
 } finally {
 setProcessingId(null);
 }
 };

 const handleReject = async (id: number) => {
 const note = prompt("Lý do từ chối:");
 if (!note) return;

 setProcessingId(id);
 try {
 await api.post(`/verification/${id}/reject`, { note });
 setVerificationRequests(prev => prev.filter(req => req.id !== id));
 } catch (error) {
 console.error("Failed to reject", error);
 } finally {
 setProcessingId(null);
 }
 };

 const handleApproveWithdrawal = async (id: number) => {
 if (!window.confirm("Xác nhận ĐÃ chuyển khoản thành công?")) return;
 setProcessingId(id);
 try {
 await api.put(`/admin/withdrawals/${id}/approve`);
 setWithdrawals(prev => prev.filter(w => w.id !== id));
 alert("Đã duyệt yêu cầu rút tiền thành công!");
 } catch (error) {
 console.error("Failed to approve withdrawal", error);
 alert("Có lỗi xảy ra khi duyệt");
 } finally {
 setProcessingId(null);
 }
 };

 const handleRejectWithdrawal = async (id: number) => {
 if (!window.confirm("Bạn có chắc chắn muốn TỪ CHỐI và HOÀN TIỀN yêu cầu này?")) return;
 setProcessingId(id);
 try {
 await api.put(`/admin/withdrawals/${id}/reject`);
 setWithdrawals(prev => prev.filter(w => w.id !== id));
 alert("Đã từ chối và hoàn tiền thành công!");
 } catch (error) {
 console.error("Failed to reject withdrawal", error);
 alert("Có lỗi xảy ra khi từ chối");
 } finally {
 setProcessingId(null);
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Quản Trị</h1>
 <div className="flex space-x-3">
 <button
 onClick={() => setActiveTab('overview')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Tổng Quan
 </button>
 <button
 onClick={() => setActiveTab('users')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Người Dùng
 </button>
 <button
 onClick={() => setActiveTab('campaigns')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'campaigns' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Chiến Dịch
 </button>
 <button
 onClick={() => setActiveTab('banners')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'banners' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Quản Lý Banners
 </button>
 <button
 onClick={() => setActiveTab('verifications')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verifications' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Yêu Cầu Xác Minh
 {verificationRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{verificationRequests.length}</span>}
 </button>
 <button
 onClick={() => setActiveTab('withdrawals')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'withdrawals' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Rút Tiền
 {withdrawals.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{withdrawals.length}</span>}
 </button>
 <button
 onClick={() => setActiveTab('support')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'support' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
 >
 Khiếu Nại
 {supportTickets.filter(t => t.status === 'PENDING').length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{supportTickets.filter(t => t.status === 'PENDING').length}</span>}
 </button>
 </div>
 </div>

 {activeTab === 'overview' && (
 <>
 {/* Stats Grid */}
 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">Tổng Người Dùng</dt>
 <dd>
 <div className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</div>
 </dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <ShoppingBag className="h-6 w-6 text-gray-400" aria-hidden="true" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">Chiến Dịch Hoạt Động</dt>
 <dd>
 <div className="text-lg font-medium text-gray-900">{stats.activeCampaigns.toLocaleString()}</div>
 </dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <DollarSign className="h-6 w-6 text-gray-400" aria-hidden="true" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">Tổng Doanh Thu</dt>
 <dd>
 <div className="text-lg font-medium text-gray-900">{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'} ₫</div>
 </dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 {/* Commission Card */}
 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <Wallet className="h-6 w-6 text-gray-400" aria-hidden="true" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">Hoa Hồng (10%)</dt>
 <dd>
 <div className="text-lg font-medium text-gray-900">
 {stats.totalCommission ? stats.totalCommission.toLocaleString() : '0'} ₫
 </div>
 </dd>
 </dl>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Charts Section */}
 <div className="mt-8">
 <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
 <h2 className="text-lg font-medium text-gray-900">Dòng Tiền Hoạt Động</h2>
 <div className="flex items-center space-x-3">
 {chartMode === 'custom' && (
 <div className="flex items-center space-x-2">
 <input 
 type="date" 
 value={customStartDate} 
 onChange={(e) => setCustomStartDate(e.target.value)}
 className="border-gray-300 rounded-md shadow-sm text-sm p-1.5 border focus:border-black"
 />
 <span className="text-gray-500 text-sm">đến</span>
 <input 
 type="date" 
 value={customEndDate} 
 onChange={(e) => setCustomEndDate(e.target.value)}
 className="border-gray-300 rounded-md shadow-sm text-sm p-1.5 border focus:border-black"
 />
 </div>
 )}
 <select
 className="border-gray-300 rounded-md shadow-sm text-sm py-1.5 pl-3 pr-8 border focus:border-black bg-white"
 value={chartMode}
 onChange={(e) => setChartMode(e.target.value)}
 >
 <option value="7days">7 ngày qua</option>
 <option value="30days">30 ngày qua</option>
 <option value="thisMonth">Tháng này</option>
 <option value="thisYear">Năm nay</option>
 <option value="custom">Khoảng ngày tuỳ chọn</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* Revenue Line Chart */}
 <div className="bg-white p-5 shadow rounded-lg w-full h-80">
 <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider">Doanh Thu Hệ Thống (Tr ₫)</h3>
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
 <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={30} />
 <YAxis tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)} Tr` : `${(val / 1000).toFixed(0)} N`} tick={{ fontSize: 12 }} width={55} />
 <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Doanh Thu']} labelStyle={{ color: 'black' }} />
 <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>

 {/* Commission Bar Chart */}
 <div className="bg-white p-5 shadow rounded-lg w-full h-80">
 <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider">Hoa Hồng Thu Về (N ₫)</h3>
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
 <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={30} />
 <YAxis tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)} Tr` : `${(val / 1000).toFixed(0)} N`} tick={{ fontSize: 12 }} width={55} />
 <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Hoa Hồng']} cursor={{ fill: '#f3f4f6' }} />
 <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </>
 )}

 {activeTab === 'users' && (
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-4 py-5 sm:p-6">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg leading-6 font-medium text-gray-900">Quản Lý Người Dùng</h3>
 <button onClick={openAddUserModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition-colors">
 <Plus size={16} className="mr-1" /> Thêm User
 </button>
 </div>

 {/* Users Filter/Search Row */}
 <div className="mb-4 flex flex-col sm:flex-row gap-4">
 <input
 type="text"
 placeholder="Tìm kiếm theo tên hoặc email..."
 className="border rounded p-2 flex-grow text-sm focus:outline-none "
 value={userSearchText}
 onChange={(e) => setUserSearchText(e.target.value)}
 />
 <select
 className="border rounded p-2 text-sm focus:outline-none min-w-[200px]"
 value={userRoleFilter}
 onChange={(e) => setUserRoleFilter(e.target.value)}
 >
 <option value="ALL">Tất cả vai trò</option>
 <option value="ADMIN">Quản trị viên (ADMIN)</option>
 <option value="CREATOR">Thương hiệu (CREATOR)</option>
 <option value="RECEIVER">Người ảnh hưởng (RECEIVER)</option>
 </select>
 </div>

 {loading ? (
 <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
 ) : (
 <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
 <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
 <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai Trò</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {users.filter(user => {
 const searchStr = removeAccents(userSearchText.toLowerCase());
 const matchesSearch = removeAccents(user.name.toLowerCase()).includes(searchStr) ||
 removeAccents(user.email.toLowerCase()).includes(searchStr);

 let roleName = 'USER';
 if (user.role?.name === 'ADMIN') roleName = 'ADMIN';
 else if (user.role?.name === 'CREATOR') roleName = 'CREATOR';
 else if (user.role?.name === 'RECEIVER') roleName = 'RECEIVER';

 const matchesRole = userRoleFilter === 'ALL' || roleName === userRoleFilter;
 return matchesSearch && matchesRole;
 }).map(user => (
 <tr key={user.id}>
 <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.name}</div></td>
 <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.email}</div></td>
 <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{user.role?.name || 'USER'}</span></td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
 {user.enabled ? 'Hoạt động' : 'Đã khóa'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end items-center gap-3">
 <button
 onClick={() => openEditUserModal(user)}
 className="text-blue-600 hover:text-blue-900 transition-colors"
 title="Chỉnh sửa"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleUserStatusToggle(user.id, user.enabled)}
 className={`flex items-center transition-colors ${user.enabled ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-900'}`}
 title={user.enabled ? 'Khóa' : 'Mở khóa'}
 >
 {user.enabled ? <UserX size={16} /> : <UserCheck size={16} />}
 </button>
 <button
 onClick={() => handleDeleteUser(user.id)}
 className="text-red-600 hover:text-red-900 transition-colors"
 title="Xóa"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === 'campaigns' && (
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-4 py-5 sm:p-6">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg leading-6 font-medium text-gray-900">Quản Lý Chiến Dịch</h3>
 <button onClick={openAddCampaignModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition-colors">
 <Plus size={16} className="mr-1" /> Thêm Campaign
 </button>
 </div>

 {/* Campaigns Filter/Search Row */}
 <div className="mb-4 flex flex-col items-center sm:flex-row gap-4">
 <input
 type="text"
 placeholder="Tìm kiếm tên chiến dịch, mô tả..."
 className="border rounded p-2 flex-grow w-full sm:w-auto text-sm focus:outline-none "
 value={campaignSearchText}
 onChange={(e) => setCampaignSearchText(e.target.value)}
 />
 <select
 className="border rounded p-2 text-sm focus:outline-none min-w-[150px]"
 value={campaignBrandFilter}
 onChange={(e) => setCampaignBrandFilter(e.target.value)}
 >
 <option value="ALL">Tất cả Thương Hiệu</option>
 {Array.from(new Set(campaigns.map(c => c.creator?.name || 'ADMIN (Hệ thống)'))).map(brand => (
 <option key={brand} value={brand}>{brand}</option>
 ))}
 </select>
 <select
 className="border rounded p-2 text-sm focus:outline-none min-w-[150px]"
 value={campaignStatusFilter}
 onChange={(e) => setCampaignStatusFilter(e.target.value)}
 >
 <option value="ALL">Tất cả trạng thái</option>
 <option value="DRAFT">Nháp (DRAFT)</option>
 <option value="Active">Hoạt động (Active)</option>
 <option value="Đang tuyển">Đang tuyển</option>
 <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
 </select>
 </div>

 {loading ? (
 <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
 ) : (
 <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
 <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
 <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu Đề</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Tạo</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {campaigns.filter(campaign => {
 const searchStr = removeAccents(campaignSearchText.toLowerCase());
 const matchTitle = removeAccents(campaign.title.toLowerCase()).includes(searchStr);
 const matchDesc = campaign.description ? removeAccents(campaign.description.toLowerCase()).includes(searchStr) : false;
 const matchesSearch = matchTitle || matchDesc;

 const creatorName = campaign.creator?.name || 'ADMIN (Hệ thống)';
 const matchesBrand = campaignBrandFilter === 'ALL' || creatorName === campaignBrandFilter;

 const matchesStatus = campaignStatusFilter === 'ALL' || campaign.status === campaignStatusFilter;
 return matchesSearch && matchesStatus && matchesBrand;
 }).map(camp => (
 <tr key={camp.id}>
 <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 break-words">{camp.title}</div></td>
 <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{camp.creator?.name || 'ADMIN (Hệ thống)'}</div></td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${camp.status === 'Active' || camp.status === 'Đang tuyển' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
 {camp.status === 'Active' || camp.status === 'Đang tuyển' ? 'Đang Hoạt Động' : camp.status === 'COMPLETED' ? 'Đã Hoàn Thành' : camp.status === 'CLOSED' ? 'Đã Đóng' : camp.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end items-center gap-3">
 <button
 onClick={() => openEditCampaignModal(camp)}
 className="text-blue-600 hover:text-blue-900 transition-colors"
 title="Chỉnh sửa chiến dịch"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDeleteCampaign(camp.id)}
 className="text-red-600 hover:text-red-900 transition-colors"
 title="Xóa chiến dịch"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === 'banners' && (
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-4 py-5 sm:p-6">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg leading-6 font-medium text-gray-900">Quản Lý Banner</h3>
 <button onClick={openAddBannerModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition-colors">
 <Plus size={16} className="mr-1" /> Thêm Banner
 </button>
 </div>

 {/* Banners Filter Row */}
 <div className="mb-4 flex flex-col sm:flex-row gap-4">
 <select
 className="border rounded p-2 text-sm flex-grow focus:outline-none "
 value={bannerTypeFilter}
 onChange={(e) => setBannerTypeFilter(e.target.value)}
 >
 <option value="ALL">Tất cả các loại Banner</option>
 <option value="IMAGE">Ảnh (Image)</option>
 <option value="YOUTUBE">Video ngúng (YouTube)</option>
 </select>
 <select
 className="border rounded p-2 text-sm flex-grow focus:outline-none "
 value={bannerStatusFilter}
 onChange={(e) => setBannerStatusFilter(e.target.value)}
 >
 <option value="ALL">Tất cả trạng thái</option>
 <option value="ACTIVE">Đang bật (Active)</option>
 <option value="INACTIVE">Đã tắt (Inactive)</option>
 </select>
 </div>

 {loading ? (
 <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
 ) : (
 <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
 <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
 <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ Tự</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {banners.filter(banner => {
 const matchesType = bannerTypeFilter === 'ALL' || banner.type === bannerTypeFilter;
 const isAvail = banner.isActive ? 'ACTIVE' : 'INACTIVE';
 const matchesStatus = bannerStatusFilter === 'ALL' || isAvail === bannerStatusFilter;
 return matchesType && matchesStatus;
 }).map(banner => (
 <tr key={banner.id}>
 <td className="px-6 py-4">
 <div className="w-48 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center relative">
 {banner.type === 'YOUTUBE' ? (
 <div className="absolute inset-0 bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs flex-col">
 <span>YOUTUBE</span>
 <span className="text-[10px] text-gray-500 truncate mt-1 max-w-[90%]">{banner.videoUrl}</span>
 </div>
 ) : (
 <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x200?text=Invalid+Image'; }} />
 )}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{banner.displayOrder}</div></td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
 {banner.isActive ? 'Đang bật' : 'Đã tắt'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end items-center gap-3">
 <button onClick={() => openEditBannerModal(banner)} className="text-blue-600 hover:text-blue-900"><Edit2 size={16} /></button>
 <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
 </div>
 </td>
 </tr>
 ))}
 {banners.length === 0 && (
 <tr>
 <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có banner nào được tạo.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === 'verifications' && (
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
 <h3 className="text-lg font-medium text-gray-900">Yêu Cầu Xác Minh Chờ Xử Lý</h3>
 <button onClick={fetchVerificationRequests} className="text-sm text-indigo-600 hover:text-indigo-900">Làm mới</button>
 </div>
 {/* Verifications Filter/Search Row */}
 <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
 <input
 type="text"
 placeholder="Tìm kiếm theo tên..."
 className="border rounded p-2 flex-grow text-sm"
 value={verificationSearchText}
 onChange={(e) => setVerificationSearchText(e.target.value)}
 />
 <select
 className="border rounded p-2 text-sm"
 value={verificationStatusFilter}
 onChange={(e) => setVerificationStatusFilter(e.target.value)}
 >
 <option value="ALL">Tất cả trang thái</option>
 <option value="PENDING">Đang chờ xử lý (Pending)</option>
 <option value="APPROVED">Đã phê duyệt (Approved)</option>
 <option value="REJECTED">Đã từ chối (Rejected)</option>
 </select>
 </div>

 {loadingVerifications ? (
 <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
 ) : verificationRequests.filter(req => {
 const searchStr = removeAccents(verificationSearchText.toLowerCase());
 const matchesSearch = removeAccents(req.user?.name.toLowerCase()).includes(searchStr);
 const matchesStatus = verificationStatusFilter === 'ALL' || req.status === verificationStatusFilter;
 return matchesSearch && matchesStatus;
 }).length === 0 ? (
 <div className="p-12 text-center text-gray-500">Tuyệt vời! Không có yêu cầu nào đang chờ xử lý.</div>
 ) : (
 <ul className="divide-y divide-gray-200">
 {verificationRequests.filter(req => {
 const searchStr = removeAccents(verificationSearchText.toLowerCase());
 const matchesSearch = removeAccents(req.user?.name.toLowerCase()).includes(searchStr);
 const matchesStatus = verificationStatusFilter === 'ALL' || req.status === verificationStatusFilter;
 return matchesSearch && matchesStatus;
 }).map((req) => (
 <li key={req.id} className="p-6 hover:bg-gray-50">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-blue-50 rounded-full text-blue-600">
 <ShieldCheck size={24} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900">{req.user.name}</p>
 <p className="text-xs text-gray-500">{req.user.role?.name} • {req.user.email}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 font-medium">
 {req.documentType}
 </span>
 <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <a
 href={req.documentUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
 >
 <ExternalLink size={14} className="mr-2" /> Xem TL
 </a>
 <button
 onClick={() => handleReject(req.id)}
 disabled={processingId === req.id}
 className="flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50"
 >
 <X size={14} className="mr-1" /> Từ Chối
 </button>
 <button
 onClick={() => handleApprove(req.id)}
 disabled={processingId === req.id}
 className="flex items-center px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
 >
 {processingId === req.id ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
 Duyệt
 </button>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 )}

 {/* User Modal */}
 {isUserModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
 <button
 onClick={() => setIsUserModalOpen(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
 >
 <X size={20} />
 </button>

 <h3 className="text-lg font-bold text-gray-900 mb-4">
 {editingUser ? 'Cập Nhật User' : 'Thêm User Mới'}
 </h3>

 <form onSubmit={handleUserSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Họ Tên</label>
 <input
 type="text"
 required
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={userFormData.name}
 onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
 <input
 type="email"
 required
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={userFormData.email}
 onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {editingUser && '(Tùy chọn)'}</label>
 <input
 type="password"
 required={!editingUser}
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={userFormData.password}
 placeholder={editingUser ? "Để trống nếu không muốn đổi" : ""}
 onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role)</label>
 <select
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={userFormData.role}
 onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
 >
 <option value="USER">USER (Khách)</option>
 <option value="RECEIVER">RECEIVER</option>
 <option value="CREATOR">CREATOR</option>
 <option value="ADMIN">ADMIN</option>
 </select>
 </div>

 <button
 type="submit"
 disabled={userFormSubmitting}
 className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
 >
 {userFormSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Lưu Thay Đổi'}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Campaign Modal */}
 {isCampaignModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
 <button
 onClick={() => setIsCampaignModalOpen(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
 >
 <X size={20} />
 </button>

 <h3 className="text-lg font-bold text-gray-900 mb-4">
 {editingCampaign ? 'Chỉnh Sửa Chiến Dịch' : 'Thêm Chiến Dịch Mới'}
 </h3>

 <form onSubmit={handleCampaignSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (Title) *</label>
 <input
 type="text"
 required
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={campaignFormData.title}
 placeholder="Nhập tiêu đề chiến dịch"
 onChange={(e) => setCampaignFormData({ ...campaignFormData, title: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
 <textarea
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border min-h-[120px]"
 value={campaignFormData.description}
 placeholder="Nội dung, yêu cầu chiến dịch..."
 onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái (Status)</label>
 <select
 className="w-full rounded-md border-gray-300 shadow-sm focus:border-black py-2 px-3 border"
 value={campaignFormData.status}
 onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value })}
 >
 <option value="Hoạt động">Hoạt động</option>
 <option value="Đang tuyển">Đang tuyển</option>
 <option value="Đóng">Đóng</option>
 <option value="Hết hạn">Hết hạn</option>
 </select>
 </div>

 <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
 <p className="text-xs text-blue-800">
 <strong>Lưu ý:</strong> Đây là công cụ thêm sửa nhanh thông tin thô của chiến dịch cho Quản trị viên. Quản trị viên sẽ được ghi nhận là Người tạo (Creator) của Chiến dịch này.
 </p>
 </div>

 <button
 type="submit"
 disabled={campaignFormSubmitting}
 className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
 >
 {campaignFormSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Lưu Thay Đổi'}
 </button>
 </form>
 </div>
 </div>
 )}

 {activeTab === 'withdrawals' && (
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
 <h3 className="text-lg font-medium text-gray-900">Yêu Cầu Rút Tiền Chờ Thông Qua</h3>
 <button onClick={fetchWithdrawals} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
 <Loader2 size={14} className={loadingWithdrawals ? "animate-spin" : "hidden"} /> Làm mới
 </button>
 </div>

 {loadingWithdrawals ? (
 <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
 ) : withdrawals.length === 0 ? (
 <div className="p-12 text-center text-gray-500">Tuyệt vời! Không có yêu cầu rút tiền nào đang chờ xử lý.</div>
 ) : (
 <ul className="divide-y divide-gray-200">
 {withdrawals.map((req) => (
 <li key={req.id} className="p-6 hover:bg-gray-50">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-red-50 rounded-full text-red-600">
 <DollarSign size={24} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900 mb-1">
 Ngân Hàng: <span className="text-indigo-600">{req.wallet?.bankName || 'Không rõ'}</span>
 </p>
 <p className="text-xs text-gray-600 mb-1">
 Chủ tài khoản: <span className="font-semibold text-gray-900">{req.wallet?.bankAccountName || 'Không rõ'}</span>
 </p>
 <p className="text-xs text-gray-600 mb-2">
 Số tài khoản: <span className="font-semibold text-gray-900 tracking-wider">{(req.wallet?.bankAccountNumber || '').replace(/(.{4})/g, '$1 ').trim()}</span>
 </p>
 <div className="flex items-center gap-2">
 <span className="text-xs text-gray-500">ID Ví: {req.wallet?.id} • Nguời dùng: {req.wallet?.user?.name || req.wallet?.user?.email}</span>
 </div>
 </div>
 </div>
 <div className="flex flex-col items-end gap-3 text-right">
 <p className="text-xl font-bold text-red-600 flex items-center gap-2">
 - {req.amount.toLocaleString()} VND
 </p>
 <div className="flex space-x-3">
 <button
 onClick={() => handleRejectWithdrawal(req.id)}
 disabled={processingId === req.id}
 className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white rounded-md text-sm font-medium transition-colors focus:outline-none -red-500 disabled:opacity-50"
 >
 Từ Chối & Hoàn Tiền
 </button>
 <button
 onClick={() => setTransferQRModalData(req)}
 className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50"
 >
 Quét QR Chuyển Tiền
 </button>
 <button
 onClick={() => handleApproveWithdrawal(req.id)}
 disabled={processingId === req.id}
 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm focus:outline-none disabled:opacity-50 flex items-center"
 >
 {processingId === req.id && <Loader2 className="animate-spin inline mr-2" size={16} />}
 Đã Chuyển Khoản Trực Tiếp
 </button>
 </div>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 )}

 {/* Banner Modal */}
 {isBannerModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
 <button onClick={() => setIsBannerModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
 <h3 className="text-lg font-bold text-gray-900 mb-4">{editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}</h3>
 <form onSubmit={handleBannerSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Loại Banner</label>
 <div className="flex space-x-4">
 <label className="flex items-center">
 <input type="radio" value="IMAGE" checked={bannerFormData.type === 'IMAGE'} onChange={() => setBannerFormData({ ...bannerFormData, type: 'IMAGE' })} className="mr-2" /> Ảnh
 </label>
 <label className="flex items-center">
 <input type="radio" value="YOUTUBE" checked={bannerFormData.type === 'YOUTUBE'} onChange={() => setBannerFormData({ ...bannerFormData, type: 'YOUTUBE' })} className="mr-2" /> YouTube Video
 </label>
 </div>
 </div>

 {bannerFormData.type === 'IMAGE' ? (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tải ảnh lên (Image) *</label>
 <div className="flex items-center space-x-2">
 <input type="file" accept="image/*" onChange={handleBannerImageUpload} disabled={uploadingImage} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
 {uploadingImage && <Loader2 className="animate-spin text-indigo-600" size={20} />}
 </div>
 {bannerFormData.imageUrl && (
 <div className="mt-2 text-sm text-green-600 truncate">Ảnh đã tải: {bannerFormData.imageUrl}</div>
 )}
 </div>
 ) : (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Link YouTube (Video URL) *</label>
 <input type="url" required className="w-full border rounded p-2" value={bannerFormData.videoUrl} onChange={(e) => setBannerFormData({ ...bannerFormData, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Link đích (Target URL - tuỳ chọn)</label>
 <input type="url" className="w-full border rounded p-2" value={bannerFormData.targetUrl} onChange={(e) => setBannerFormData({ ...bannerFormData, targetUrl: e.target.value })} placeholder="https://influconnect.com/campaign/1" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự ưu tiên (Nhỏ = Xếp trước)</label>
 <input type="number" className="w-full border rounded p-2" value={bannerFormData.displayOrder} onChange={(e) => setBannerFormData({ ...bannerFormData, displayOrder: parseInt(e.target.value) || 0 })} />
 </div>
 <div className="flex items-center">
 <input type="checkbox" id="isActive" checked={bannerFormData.isActive} onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
 <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Bật hiển thị</label>
 </div>
 <button type="submit" disabled={bannerFormSubmitting} className="w-full mt-4 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50">
 {bannerFormSubmitting ? <Loader2 className="animate-spin inline mr-2" size={16} /> : 'Lưu Thay Đổi'}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Transfer QR Modal */}
 {transferQRModalData && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 inset-0 relative animate-in fade-in zoom-in duration-200">
 <button
 onClick={() => setTransferQRModalData(null)}
 className="absolute z-10 top-4 right-4 bg-white/80 p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all shadow-sm"
 >
 <X size={20} className="stroke-[2.5px]" />
 </button>
 
 <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 pb-2 border-b border-indigo-100">
 <h3 className="text-xl font-black text-indigo-900 leading-tight">Chuyển Khoản<br/>Giải Ngân</h3>
 <p className="text-xs font-semibold text-indigo-600/80 uppercase tracking-widest mt-1 mb-2">VietQR</p>
 </div>
 
 <div className="p-6">
 <div className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 mb-6 mx-auto flex justify-center">
 <img
 src={transferQRModalData.qrCodeUrl}
 alt="QR Code For Transfer"
 className="w-48 h-48 rounded-xl object-contain"
 />
 </div>
 
 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 shadow-inner">
 <div className="space-y-1.5">
 <div className="flex justify-between items-center">
 <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Người Nhận</span>
 <span className="text-sm font-bold text-gray-900">{transferQRModalData.accountName}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Ngân Hàng</span>
 <span className="text-sm font-bold text-gray-900 uppercase">{transferQRModalData.bankName}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Số TK</span>
 <span className="text-sm font-bold text-gray-900 font-mono tracking-wide">{transferQRModalData.accountNumber}</span>
 </div>
 <hr className="border-indigo-100 my-2" />
 <div className="flex justify-between items-center">
 <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Số tiền</span>
 <span className="text-base font-black text-red-600">{transferQRModalData.amount.toLocaleString()} ₫</span>
 </div>
 </div>
 </div>
 
 <button
 onClick={() => {
 handleApproveWithdrawal(transferQRModalData.id);
 setTransferQRModalData(null);
 }}
 className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 transition-all "
 >
 Xác nhận Đã Chuyển Tiền
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default AdminDashboard;
