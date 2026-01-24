import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Loader2, Link, Check, Clock, XCircle, FileCheck, UploadCloud, ArrowRight } from 'lucide-react';

interface VerificationRequest {
    id: number;
    documentType: string;
    documentUrl: string;
    status: string;
    adminNote: string;
    createdAt: string;
}

const VerificationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [uploadMode, setUploadMode] = useState<'link' | 'upload'>('upload');
    const [documentUrl, setDocumentUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/verification/my-status');
            const sorted = response.data.sort((a: any, b: any) => b.id - a.id);
            setRequests(sorted);
            
            // Trigger confetti if recently approved
            if (sorted.length > 0 && sorted[0].status === 'APPROVED' && !showConfetti) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (error) {
            console.error("Failed to fetch verification status");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocumentUrl(response.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("File upload failed. Please try again or use a link.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentUrl) return;

        setIsSubmitting(true);
        try {
            await api.post('/verification/request', {
                documentType: user?.role?.name === 'CREATOR' ? 'BUSINESS_LICENSE' : 'ID_CARD',
                documentUrl: documentUrl
            });
            setDocumentUrl('');
            await fetchStatus();
            // Refresh auth user to update verified badge in header
            window.location.reload(); 
        } catch (error: any) {
            alert(error.response?.data || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    const latestRequest = requests.length > 0 ? requests[0] : null;
    const status = latestRequest?.status; // PENDING, APPROVED, REJECTED
    
    // Step Calculation
    const getStepStatus = (stepIndex: number) => {
        if (!latestRequest) return stepIndex === 0 ? 'current' : 'upcoming';
        if (status === 'REJECTED') return stepIndex === 2 ? 'error' : 'completed';
        if (status === 'APPROVED') return 'completed';
        // PENDING
        if (stepIndex === 0) return 'completed';
        if (stepIndex === 1) return 'current'; // AI/Admin Check
        return 'upcoming';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Confetti CSS Effect (Simple) */}
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
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    top: -10px;
                    animation: fall 3s linear infinite;
                }
                @keyframes fall {
                    to { transform: translateY(100vh) rotate(720deg); }
                }
            `}</style>
        
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black mb-6 flex items-center gap-2 transition-colors">
                     <ArrowRight className="rotate-180" size={16} /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center text-white relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3">
                                <div className="inline-flex p-2 rounded-full bg-white/20 backdrop-blur-sm">
                                    <ShieldCheck size={28} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-extrabold tracking-tight">Account Verification</h1>
                            </div>
                            <p className="mt-2 text-blue-100 text-lg max-w-lg mx-auto">
                                {user?.role?.name === 'CREATOR' 
                                    ? 'Verify your business to unlock premium campaign features.' 
                                    : 'Verify your identity to build trust and get more jobs.'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        {status === 'APPROVED' ? (
                            <div className="text-center animate-in fade-in zoom-in duration-500">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm ring-4 ring-green-50">
                                    <Check size={40} strokeWidth={3} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verification Successful!</h2>
                                <p className="text-gray-500 mt-2 text-lg">Your account has been fully verified.</p>
                                <div className="mt-8">
                                    <button onClick={() => navigate('/profile')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        View Profile
                                    </button>
                                </div>
                                
                                {latestRequest?.documentUrl && (
                                     <div className="mt-8 pt-8 border-t border-gray-100">
                                        <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider font-semibold">Verified Document</p>
                                        <a href={latestRequest.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative group">
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <span className="text-white font-medium text-sm">View Full Size</span>
                                            </div>
                                            <img src={latestRequest.documentUrl} alt="Verified Document" className="h-40 object-contain rounded-lg border border-gray-200 shadow-sm" />
                                        </a>
                                     </div>
                                )}
                            </div>
                        ) : status === 'PENDING' ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center max-w-lg mx-auto">
                                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                                <h3 className="text-xl font-bold text-blue-900">Verification in Progress</h3>
                                <p className="text-blue-700 mt-2 mb-6">
                                    Our AI is analyzing your document. If it requires manual review, it may take up to 24 hours.
                                </p>
                                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm text-left flex items-center gap-3">
                                    <FileCheck className="text-blue-500 shrink-0" />
                                    <div className="truncate flex-1">
                                        <div className="text-xs uppercase font-semibold text-gray-400">Submitted Document</div>
                                        <a href={latestRequest?.documentUrl} target="_blank" className="text-blue-600 hover:underline truncate">
                                            {latestRequest?.documentUrl}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto">
                                {status === 'REJECTED' && (
                                    <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>{latestRequest?.adminNote || "Your document was rejected. Please try again."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">Submit Identification</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Please provide a clear image of your {user?.role?.name === 'CREATOR' ? 'Business License' : 'Citizen ID (CCCD)'}.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Upload Mode Switcher */}
                                    <div className="flex justify-center">
                                        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                             <button
                                                type="button"
                                                onClick={() => setUploadMode('upload')}
                                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Upload File
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('link')}
                                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Paste Link
                                            </button>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="min-h-[200px]">
                                        {uploadMode === 'upload' ? (

                                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${documentUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'}`}>
                                                {isUploading ? (
                                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                                ) : documentUrl ? (
                                                     <div className="relative group w-full h-full flex flex-col items-center justify-center">
                                                        <img src={documentUrl} alt="Preview" className="h-28 object-contain rounded shadow-sm" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                            <span className="text-white font-medium">Click to change</span>
                                                        </div>
                                                     </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                            </label>
                                        ) : (
                                            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Document URL</label>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Link className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="url"
                                                        required
                                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                                        placeholder="https://drive.google.com/..."
                                                        value={documentUrl}
                                                        onChange={(e) => setDocumentUrl(e.target.value)}
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Ensure the link is accessible (e.g., Google Drive "Anyone with the link").
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !documentUrl}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Submit'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
                


                {/* FAQ / Trust Badges - Compacted */}
                <div className="mt-6 flex justify-center gap-8 text-center bg-white py-4 px-6 rounded-xl shadow-sm">
                    <div>
                         <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Secure Data</div>
                         <div className="font-bold text-gray-700">Encrypted</div>
                    </div>
                    <div>
                         <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Processing</div>
                         <div className="font-bold text-gray-700">~24h</div>
                    </div>
                     <div>
                         <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Trusted</div>
                         <div className="font-bold text-gray-700">500+</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepIndicator = ({ icon: Icon, label, status }: { icon: any, label: string, status: string }) => {
    // status: 'completed' | 'current' | 'upcoming' | 'error'
    const colorClass = 
        status === 'completed' ? 'bg-green-500 text-white border-green-500' :
        status === 'current' ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100' :
        status === 'error' ? 'bg-red-500 text-white border-red-500' :
        'bg-white text-gray-400 border-gray-300';

    return (
        <div className="flex flex-col items-center relative z-10 bg-white px-2">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${colorClass}`}>
                <Icon size={20} />
            </div>
            <span className={`text-xs font-semibold mt-2 uppercase tracking-wide ${status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>{label}</span>
        </div>
    )
}

export default VerificationPage;
