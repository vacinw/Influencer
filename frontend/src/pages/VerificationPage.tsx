import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Check, FileCheck, UploadCloud, ArrowRight, User as UserIcon, Briefcase } from 'lucide-react';

interface VerificationRequest {
    id: number;
    documentType: string;
    documentUrl: string;
    status: string;
    adminNote: string;
    createdAt: string;
}

// Sub-component for individual verification card
const VerificationCard = ({
    type,
    request,
    onRefresh
}: {
    type: 'ID_CARD' | 'BUSINESS_LICENSE',
    request: VerificationRequest | null,
    onRefresh: () => void
}) => {
    const isIdentity = type === 'ID_CARD';
    const title = isIdentity ? 'Xác Minh Danh Tính' : 'Giấy Phép Kinh Doanh';
    const description = isIdentity
        ? 'Xác minh danh tính của bạn tức thì bằng AI.'
        : 'Xác minh tư cách pháp nhân doanh nghiệp (Duyệt thủ công).';

    // Local state for each card
    const [localUrl, setLocalUrl] = useState('');
    const [localUploading, setLocalUploading] = useState(false);
    const [localSubmitting, setLocalSubmitting] = useState(false);
    const [localMode, setLocalMode] = useState<'upload' | 'link'>('upload');

    const status = request?.status;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLocalUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.url;
            setLocalUrl(url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Tải tệp lên thất bại. Vui lòng thử lại hoặc dùng liên kết.");
        } finally {
            setLocalUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!localUrl) return;

        setLocalSubmitting(true);
        try {
            await api.post('/verification/request', {
                documentType: type,
                documentUrl: localUrl
            });
            setLocalUrl('');
            await onRefresh();
            window.location.reload();
        } catch (error: any) {
            alert(error.response?.data || "Gửi yêu cầu thất bại");
        } finally {
            setLocalSubmitting(false);
        }
    };

    if (status === 'APPROVED') {
        return (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title} Đã Được Xác Minh</h3>
                <p className="text-gray-500 mt-2 mb-6">{isIdentity ? 'Danh tính cá nhân' : 'Doanh nghiệp'} của bạn đã được xác minh thành công.</p>
                {request?.documentUrl && (
                    <a href={request.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center justify-center">
                        <FileCheck size={16} className="mr-1" /> Xem Tài Liệu
                    </a>
                )}
            </div>
        );
    }

    if (status === 'PENDING') {
        return (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Loader2 size={32} className="animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{isIdentity ? 'Đang phân tích...' : 'Đang Chờ Duyệt'}</h3>
                <p className="text-blue-700 mt-2 mb-6">
                    {isIdentity
                        ? 'Hệ thống AI đang xác minh danh tính của bạn. Thường chỉ mất vài giây.'
                        : 'Giấy phép kinh doanh của bạn đang được đội ngũ của chúng tôi xem xét (~24h).'}
                </p>
                <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 text-left flex items-center">
                    <FileCheck size={16} className="text-gray-400 mr-2 shrink-0" />
                    <span className="text-xs text-gray-500 truncate flex-1">{request?.documentUrl}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-full flex flex-col">
            <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-3">
                    {isIdentity ? <UserIcon size={24} /> : <Briefcase size={24} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>

            {status === 'REJECTED' && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                    <div className="text-xs text-red-700">
                        <strong>Từ chối:</strong> {request?.adminNote || "Tài liệu bị từ chối. Vui lòng thử lại."}
                    </div>
                </div>
            )}

            <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                        <button onClick={() => setLocalMode('upload')} className={`px-3 py-1 rounded text-xs font-medium transition-all ${localMode === 'upload' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Tải lên</button>
                        <button onClick={() => setLocalMode('link')} className={`px-3 py-1 rounded text-xs font-medium transition-all ${localMode === 'link' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Liên kết (Link)</button>
                    </div>
                </div>

                <div className="h-40 mb-auto">
                    {localMode === 'upload' ? (
                        <label className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all ${localUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
                            {localUploading ? <Loader2 className="animate-spin text-blue-500" /> : localUrl ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <img src={localUrl} alt="Preview" className="h-32 object-contain" />
                                    <span className="absolute bottom-1 bg-black/50 text-white text-[10px] px-2 rounded">Thay đổi</span>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                    <span className="text-xs text-gray-500">Nhấp để tải lên</span>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                        </label>
                    ) : (
                        <div className="flex flex-col h-full justify-center">
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                                value={localUrl}
                                onChange={(e) => setLocalUrl(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 mt-2">Đảm bảo liên kết có thể truy cập công khai.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={localSubmitting || !localUrl}
                    className="w-full py-3 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors flex justify-center items-center mt-4"
                >
                    {localSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Gửi Yêu Cầu Xác Minh'}
                </button>
            </div>
        </div>
    );
};

const VerificationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);

    // Split requests state
    const [idRequest, setIdRequest] = useState<VerificationRequest | null>(null);
    const [businessRequest, setBusinessRequest] = useState<VerificationRequest | null>(null);

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/verification/my-status');
            const data = response.data;

            // Sort by ID desc to get latest
            const sorted = data.sort((a: any, b: any) => b.id - a.id);
            setRequests(sorted);

            // Split requests by type
            const latestId = sorted.find((r: any) => r.documentType === 'ID_CARD');
            const latestBusiness = sorted.find((r: any) => r.documentType === 'BUSINESS_LICENSE');

            setIdRequest(latestId || null);
            setBusinessRequest(latestBusiness || null);

            // Trigger confetti if recently approved (check both)
            if ((latestId?.status === 'APPROVED' || latestBusiness?.status === 'APPROVED') && !showConfetti) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (error) {
            console.error("Failed to fetch verification status");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    const isCreator = user?.role?.name === 'CREATOR';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)]
                        }} />
                    ))}
                </div>
            )}
            <style>{`
                .confetti { position: absolute; width: 10px; height: 10px; top: -10px; animation: fall 3s linear infinite; }
                @keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }
            `}</style>

            <div className={`mx-auto ${isCreator ? 'max-w-4xl' : 'max-w-xl'}`}>
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black mb-6 flex items-center gap-2 transition-colors">
                    <ArrowRight className="rotate-180" size={16} /> Quay lại
                </button>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Trung Tâm Xác Minh</h1>
                    <p className="mt-2 text-gray-600">
                        {isCreator
                            ? 'Hoàn thành các bước dưới đây để xác minh tài khoản và doanh nghiệp của bạn.'
                            : 'Xác minh CMND/CCCD để xây dựng niềm tin với cộng đồng.'}
                    </p>
                </div>

                {isCreator ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                        <VerificationCard type="ID_CARD" request={idRequest} onRefresh={fetchStatus} />
                        <VerificationCard type="BUSINESS_LICENSE" request={businessRequest} onRefresh={fetchStatus} />
                    </div>
                ) : (
                    <VerificationCard type="ID_CARD" request={requests.find(r => r.documentType === 'ID_CARD') || null} onRefresh={fetchStatus} />
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
