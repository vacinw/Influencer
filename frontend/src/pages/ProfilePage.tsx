import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Link as LinkIcon, Edit3, ShieldCheck, Mail, Phone, Camera, Loader2, Clock, XCircle, Check, Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Star } from 'lucide-react';
import { Rating } from 'react-simple-star-rating';

const ProfilePage = () => {
    const { user: initialUser, checkAuth } = useAuth();
    const [user, setUser] = useState<any>(initialUser);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [reviewsData, setReviewsData] = useState<{ averageRating: number, totalReviews: number, reviews: any[] }>({ averageRating: 0, totalReviews: 0, reviews: [] });
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        avatarUrl: '',
        coverUrl: '',
        socialLinks: ['']
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user && user.id) {
            fetchReviews(user.id);
        }
    }, [user?.id]);

    const fetchReviews = async (userId: number) => {
        setLoadingReviews(true);
        try {
            const res = await api.get(`/reviews/receiver/${userId}`);
            setReviewsData(res.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const [profileRes, statusRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/verification/my-status').catch(() => ({ data: [] }))
            ]);

            setUser(profileRes.data);
            setFormData({
                name: profileRes.data.name || '',
                bio: profileRes.data.bio || '',
                phone: profileRes.data.phone || '',
                avatarUrl: profileRes.data.avatarUrl || '',
                coverUrl: profileRes.data.coverUrl || '',
                socialLinks: profileRes.data.socialLinks && profileRes.data.socialLinks.length > 0 ? profileRes.data.socialLinks : ['']
            });

            if (statusRes.data && statusRes.data.length > 0) {
                const sorted = statusRes.data.sort((a: any, b: any) => b.id - a.id);
                setVerificationStatus(sorted[0].status);
            }
        } catch (error) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/users/profile', formData);
            setIsEditing(false);
            fetchProfile();
            await checkAuth();
        } catch (error) {
            alert("Cập nhật thông tin thất bại");
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, avatarUrl: res.data.url });
            await checkAuth();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, coverUrl: res.data.url });
            await checkAuth();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploadingCover(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-gray-500 mb-4">Bạn phải đăng nhập để xem hồ sơ.</p>
                <a href="/login" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Đến trang Đăng Nhập
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Cover Image */}
            <div className="h-60 bg-gradient-to-r from-blue-600 to-indigo-700 relative group overflow-hidden">
                {(formData.coverUrl || user.coverUrl) ? (
                    <img src={isEditing ? formData.coverUrl : user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : null}

                {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-white" />
                    </div>
                )}

                {isEditing && !isUploadingCover && (
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white mr-2" />
                        <span className="text-white font-medium">Thay Đổi Ảnh Bìa</span>
                        <input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" />
                    </label>
                )}
            </div>

            {/* Profile Header */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20 sm:flex sm:items-end sm:space-x-5">
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-full ring-4 ring-white bg-white overflow-hidden relative">
                            {formData.avatarUrl || user.avatarUrl ? (
                                <img src={isEditing ? formData.avatarUrl : user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                    <User size={64} className="text-gray-400" />
                                </div>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-white" />
                                </div>
                            )}

                            {isEditing && !isUploading && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" />
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                        {/* Verified Badge on Avatar (TikTok Style) */}
                        {(user.isVerified || verificationStatus === 'APPROVED') && (
                            <div className="absolute bottom-2 right-2 bg-[#20D5EC] rounded-full p-1 border-[3px] border-white z-20" title="Tài Khoản Đã Xác Minh">
                                <Check size={12} strokeWidth={4} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-between sm:pb-2">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 truncate flex items-center gap-2">
                                {user.name}
                                {(user.isVerified || verificationStatus === 'APPROVED') && (
                                    <div className="bg-[#20D5EC] rounded-full p-0.5 inline-flex items-center justify-center w-5 h-5 ml-1">
                                        <Check size={12} strokeWidth={4} className="text-white" />
                                    </div>
                                )}
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-medium text-gray-500">{user.role?.name}</p>
                                {reviewsData.totalReviews > 0 && (
                                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                        <Star size={12} className="fill-yellow-600 mr-1" />
                                        {reviewsData.averageRating} ({reviewsData.totalReviews} đánh giá)
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
                                    <button onClick={handleSave} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Lưu</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    <Edit3 size={16} className="mr-2" /> Chỉnh Sửa Hồ Sơ
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
                    {/* Left Column (Info) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                    {[{ id: 'about', label: 'Giới Thiệu' }, { id: 'reviews', label: 'Đánh Giá' }].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900">Tiểu Sử</h3>
                                            {isEditing ? (
                                                <textarea
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    rows={4}
                                                    value={formData.bio}
                                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                />
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-600">{user.bio || "Chưa có tiểu sử."}</p>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Liên Kết Mạng Xã Hội</h3>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    {formData.socialLinks.map((link, idx) => (
                                                        <input
                                                            key={idx}
                                                            type="text"
                                                            value={link}
                                                            onChange={e => {
                                                                const newLinks = [...formData.socialLinks];
                                                                newLinks[idx] = e.target.value;
                                                                setFormData({ ...formData, socialLinks: newLinks });
                                                            }}
                                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                            placeholder="https://..."
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, socialLinks: [...formData.socialLinks, ''] })}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        + Thêm liên kết
                                                    </button>
                                                </div>
                                            ) : (
                                                <ul className="space-y-1">
                                                    {user.socialLinks?.map((link: string, idx: number) => {
                                                        const getSocialIcon = (url: string) => {
                                                            if (url.includes('facebook.com') || url.includes('fb.com')) return <Facebook size={16} className="mr-2 text-blue-600" />;
                                                            if (url.includes('twitter.com') || url.includes('x.com')) return <Twitter size={16} className="mr-2 text-black" />;
                                                            if (url.includes('instagram.com')) return <Instagram size={16} className="mr-2 text-pink-600" />;
                                                            if (url.includes('tiktok.com')) return (
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-black">
                                                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                                                </svg>
                                                            );
                                                            if (url.includes('linkedin.com')) return <Linkedin size={16} className="mr-2 text-blue-700" />;
                                                            if (url.includes('github.com')) return <Github size={16} className="mr-2 text-gray-800" />;
                                                            if (url.includes('youtube.com')) return <Youtube size={16} className="mr-2 text-red-600" />;
                                                            return <LinkIcon size={16} className="mr-2 text-gray-400" />;
                                                        };

                                                        return (
                                                            <li key={idx} className="flex items-center text-sm text-blue-600 transition-colors hover:text-blue-800">
                                                                {getSocialIcon(link)}
                                                                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">{link}</a>
                                                            </li>
                                                        );
                                                    })}
                                                    {(!user.socialLinks || user.socialLinks.length === 0) && <p className="text-sm text-gray-500">Chưa có liên kết.</p>}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        {loadingReviews ? (
                                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
                                        ) : reviewsData.reviews.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="mx-auto h-12 w-12 text-gray-400">
                                                    <ShieldCheck size={48} />
                                                </div>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đánh giá</h3>
                                                <p className="mt-1 text-sm text-gray-500">Đánh giá sẽ hiển thị tại đây khi bạn hoàn thành chiến dịch.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">{reviewsData.averageRating}</h3>
                                                        <Rating initialValue={reviewsData.averageRating} readonly size={20} allowFraction fillColor="#f59e0b" emptyColor="#e5e7eb" SVGclassName="inline-block" />
                                                        <p className="text-sm text-gray-500 mt-1">Dựa trên {reviewsData.totalReviews} đánh giá</p>
                                                    </div>
                                                </div>
                                                <ul className="divide-y divide-gray-100">
                                                    {reviewsData.reviews.map((review: any) => (
                                                        <li key={review.id} className="py-6">
                                                            <div className="flex flex-col sm:flex-row gap-4">
                                                                <div className="flex-shrink-0">
                                                                    {review.creatorAvatar ? (
                                                                        <img src={review.creatorAvatar} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="" />
                                                                    ) : (
                                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                                            {review.creatorName?.charAt(0) || 'C'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <div>
                                                                            <h4 className="text-base font-bold text-gray-900">{review.creatorName}</h4>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <Rating initialValue={review.rating} readonly size={16} fillColor="#f59e0b" emptyColor="#e5e7eb" SVGclassName="inline-block" />
                                                                                <span className="text-xs text-gray-400">
                                                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mt-3 text-sm text-gray-700 leading-relaxed italic border-l-4 border-gray-200 pl-3">"{review.content}"</p>
                                                                    <div className="mt-3 inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
                                                                        Chiến dịch: <a href={`/creator/campaigns/${review.campaignId}`} className="ml-1 hover:underline truncate max-w-[200px]">{review.campaignTitle}</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Contact/Private Status) */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Thông Tin Liên Hệ</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={16} className="mr-2 text-gray-400" />
                                    {user.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone size={16} className="mr-2 text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="border-b border-gray-300 focus:border-blue-500 outline-none"
                                            placeholder="+84..."
                                        />
                                    ) : (
                                        <span>{user.phone || "Chưa cung cấp"}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Verification Status Card */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Trạng Thái Xác Minh</h3>
                            {user.isVerified || verificationStatus === 'APPROVED' ? (
                                <div className="flex items-start">
                                    <ShieldCheck className="text-green-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {user?.role?.name === 'CREATOR' ? 'Doanh Nghiệp Đã Xác Minh' : 'Danh Tính Đã Xác Minh'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {user?.role?.name === 'CREATOR'
                                                ? 'Doanh nghiệp của bạn đã được xác minh và đáng tin cậy.'
                                                : 'Bạn là thành viên đáng tin cậy của cộng đồng.'}
                                        </p>
                                    </div>
                                </div>
                            ) : verificationStatus === 'PENDING' ? (
                                <div className="flex items-start">
                                    <Clock className="text-blue-500 mr-2 mt-0.5 animate-pulse" />
                                    <div>
                                        <p className="font-medium text-blue-700">Đang Chờ Xác Minh</p>
                                        <p className="text-sm text-blue-600 mb-3">Tài liệu của bạn đang được xem xét.</p>
                                        <a href="/verification" className="text-sm text-blue-800 font-medium hover:underline">
                                            Kiểm tra Trạng thái &rarr;
                                        </a>
                                    </div>
                                </div>
                            ) : verificationStatus === 'REJECTED' ? (
                                <div className="flex items-start">
                                    <XCircle className="text-red-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-700">Xác Minh Thất Bại</p>
                                        <p className="text-sm text-red-600 mb-3">Lần thử trước của bạn không thành công.</p>
                                        <a href="/verification" className="text-sm text-red-800 font-medium hover:underline">
                                            Thử Lại &rarr;
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-4">Xác minh danh tính để xây dựng niềm tin và mở khóa thêm tính năng.</p>
                                    <a href="/verification" className="block w-full bg-blue-50 text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                        Xác Minh Ngay
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
