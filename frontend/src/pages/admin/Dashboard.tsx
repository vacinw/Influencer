import { Users, ShoppingBag, DollarSign, Activity, ShieldCheck, Check, X, ExternalLink, Loader2, UserX, UserCheck, Edit2, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
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

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
    const [loadingVerifications, setLoadingVerifications] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const [stats, setStats] = useState({ totalUsers: 0, activeCampaigns: 0, totalRevenue: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [userFormSubmitting, setUserFormSubmitting] = useState(false);

    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<any>(null);
    const [campaignFormData, setCampaignFormData] = useState({ title: '', description: '', status: 'Active' });
    const [campaignFormSubmitting, setCampaignFormSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'verifications') {
            fetchVerificationRequests();
        } else if (activeTab === 'overview') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'campaigns') {
            fetchCampaigns();
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

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/statistics');
            setStats(res.data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
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
                        onClick={() => setActiveTab('verifications')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verifications' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Yêu Cầu Xác Minh
                        {verificationRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{verificationRequests.length}</span>}
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
                                                <div className="text-lg font-medium text-gray-900">{(stats.totalRevenue / 1000000).toFixed(1)}M ₫</div>
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
                                        <Activity className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Sức khỏe Hệ Thống</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-green-600">99.9%</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
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
                                                {users.map(user => (
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
                                                {campaigns.map(camp => (
                                                    <tr key={camp.id}>
                                                        <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900 break-words">{camp.title}</div></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{camp.creator?.name || 'ADMIN (Hệ thống)'}</div></td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${camp.status === 'Active' || camp.status === 'Đang tuyển' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {camp.status}
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

            {activeTab === 'verifications' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Yêu Cầu Xác Minh Chờ Xử Lý</h3>
                        <button onClick={fetchVerificationRequests} className="text-sm text-indigo-600 hover:text-indigo-900">Làm mới</button>
                    </div>
                    {loadingVerifications ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : verificationRequests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Tuyệt vời! Không có yêu cầu nào đang chờ xử lý.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {verificationRequests.map((req) => (
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    value={userFormData.name}
                                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {editingUser && '(Tùy chọn)'}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    value={userFormData.password}
                                    placeholder={editingUser ? "Để trống nếu không muốn đổi" : ""}
                                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role)</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    value={campaignFormData.title}
                                    placeholder="Nhập tiêu đề chiến dịch"
                                    onChange={(e) => setCampaignFormData({ ...campaignFormData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border min-h-[120px]"
                                    value={campaignFormData.description}
                                    placeholder="Nội dung, yêu cầu chiến dịch..."
                                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái (Status)</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
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
        </div>
    );
};

export default AdminDashboard;
