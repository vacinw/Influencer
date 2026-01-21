import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ClassicLayout, ShowcaseLayout, SocialLayout, MinimalLayout } from '../../components/layouts/CampaignLayouts';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { showToast } = useToast();
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [pitchMessage, setPitchMessage] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await api.get(`/campaign/${id}`);
                setCampaign(response.data);
            } catch (err) {
                console.error("Error fetching campaign", err);
                setError('Campaign not found.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCampaign();
        }
    }, [id]);

    // Check if user has already applied
    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (user?.role?.name === 'RECEIVER' && campaign?.id) {
                try {
                    const response = await api.get('/application/my-applications');
                    const applications: any[] = response.data;
                    const applied = applications.some(app => app.campaign?.id === campaign.id);
                    setHasApplied(applied);
                } catch (error) {
                    console.error("Failed to check application status", error);
                }
            }
        };

        if (isAuthenticated && user && campaign) {
            checkApplicationStatus();
        }
    }, [user, isAuthenticated, campaign]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/application/apply', {
                campaignId: campaign.id,
                message: pitchMessage,
                bidAmount: bidAmount ? parseFloat(bidAmount) : null
            });
            showToast('Application submitted successfully!', 'success');
            setIsApplyModalOpen(false);
            setHasApplied(true);
        } catch (error: any) {
            console.error("Application failed", error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to apply.';
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
                <p className="text-xl mb-4">⚠️ {error || 'Campaign not found'}</p>
                <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const isOwner = user?.id === campaign.creator?.id;

    const renderLayout = () => {
        const data = {
            ...campaign,
            tags: Array.isArray(campaign.tags) ? campaign.tags : (campaign.tags || '').split(',')
        };

        switch (campaign.layoutStyle) {
            case 'SHOWCASE': return <ShowcaseLayout data={data} />;
            case 'SOCIAL': return <SocialLayout data={data} />;
            case 'MINIMAL': return <MinimalLayout data={data} />;
            default: return <ClassicLayout data={data} />;
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-black transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2"/> Back
                </button>
                <div className="flex gap-2">
                    {isOwner ? (
                        <>
                             <button 
                                 onClick={() => navigate(`/creator/campaigns/${id}/edit`)}
                                 className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                             >
                                 Edit Campaign
                             </button>
                             <button 
                                 onClick={() => navigate(`/creator/campaigns/${id}/applicants`)}
                                 className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
                             >
                                 View Applicants
                             </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsApplyModalOpen(true)}
                            disabled={hasApplied}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors shadow-lg ${
                                hasApplied 
                                    ? 'bg-green-600 text-white cursor-default hover:bg-green-600'
                                    : 'bg-black hover:bg-gray-800 text-white'
                            }`}
                        >
                            {hasApplied ? 'Applied' : 'Apply Now'}
                        </button>
                    )}
                </div>
            </div>

            {/* Campaign Content */}
            {renderLayout()}

            {/* Application Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for this Campaign</h3>
                        <p className="text-sm text-gray-500 mb-6">Pitch yourself to the creator. Explain why you're a good fit.</p>
                        
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Pitch</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Hi, I love this brand and have an audience that matches..."
                                    value={pitchMessage}
                                    onChange={(e) => setPitchMessage(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Rate (Optional)</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignDetail;
