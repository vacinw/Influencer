import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ArrowLeft, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ApplicantsList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [campaignTitle, setCampaignTitle] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch campaign info for title
                const campRes = await api.get(`/campaign/${id}`);
                setCampaignTitle(campRes.data.title);

                // Fetch applications
                const res = await api.get(`/application/campaign/${id}`);
                setApplicants(res.data);
            } catch (error) {
                console.error("Failed to load data", error);
                showToast("Failed to load applicants", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, showToast]);

    const handleUpdateStatus = async (appId: number, newStatus: string) => {
        try {
            await api.put(`/application/${appId}/status`, { status: newStatus });
            setApplicants(prev => prev.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));
            showToast(`Application ${newStatus.toLowerCase()}!`, "success");
        } catch (error) {
            console.error("Failed to update status", error);
            showToast("Failed to update status", "error");
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
                    <ArrowLeft size={20} className="mr-2"/> Back to Campaign
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
                        <p className="text-gray-500">For campaign: <span className="font-medium text-black">{campaignTitle}</span></p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                        <span className="font-bold text-indigo-600">{applicants.length}</span> Total Applications
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                    {applicants.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p>No applicants yet.</p>
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
                                                        {app.receiver?.rating && (
                                                            <span className="flex items-center text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                                ⭐ {app.receiver.rating}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{app.receiver?.email}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 mt-3">
                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Pitch</p>
                                                <div className="flex items-start text-sm text-gray-700">
                                                    <MessageSquare size={16} className="mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                                                    <p className="italic">"{app.message}"</p>
                                                </div>
                                                {app.bidAmount && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                                         <span className="text-xs font-semibold text-gray-400 uppercase">Proposed Rate</span>
                                                         <span className="text-indigo-600 font-bold text-lg">${app.bidAmount}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() => setSelectedApplicant(app)}
                                                    className="text-sm text-indigo-600 font-medium hover:underline"
                                                >
                                                    View Full Profile
                                                </button>
                                                
                                                <div className="flex-1"></div>

                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                                                            className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle size={16} className="mr-2" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                                            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <XCircle size={16} className="mr-2" /> Reject
                                                        </button>
                                                    </>
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

            {/* Profile Modal */}
            {selectedApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApplicant(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="px-6 pb-6">
                            <div className="relative flex justify-between items-end -mt-12 mb-4">
                                <div className="p-1.5 bg-white rounded-full">
                                    {selectedApplicant.receiver?.avatarUrl ? (
                                        <img src={selectedApplicant.receiver.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border border-gray-100" />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-gray-500">
                                            {selectedApplicant.receiver?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mb-1">
                                    <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900">{selectedApplicant.receiver?.name}</h2>
                            <p className="text-gray-500 mb-4">{selectedApplicant.receiver?.email}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Bio</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {selectedApplicant.receiver?.bio || "No bio provided."}
                                    </p>
                                </div>
                                
                                {selectedApplicant.receiver?.phone && (
                                     <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <span className="font-semibold">Phone:</span> {selectedApplicant.receiver.phone}
                                     </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Social Links</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.receiver?.socialLinks?.length > 0 ? (
                                            selectedApplicant.receiver.socialLinks.map((link: string, idx: number) => (
                                                <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-indigo-600 font-medium truncate max-w-[200px]">
                                                    {link}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No links provided</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedApplicant(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;
