import { Briefcase, DollarSign, Clock, Search, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CustomSelect from '../../components/ui/CustomSelect';

interface Campaign {
    id: number;
    title: string;
    description: string;
    status: string;
    deadline: string;
    images?: string[];
    platforms?: string[];
    layoutStyle?: string;
    // budget (if available later)
}

const ReceiverDashboard = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [platform, setPlatform] = useState('All');

    const [activeTab, setActiveTab] = useState('find');
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [appsPage, setAppsPage] = useState(0);
    const [appsTotalPages, setAppsTotalPages] = useState(0);
    const [appsStatusFilter, setAppsStatusFilter] = useState('All');

    useEffect(() => {
        // Fetch applications initially to know what user has applied to (first page only for check)
        fetchMyApplications(true);
    }, []);

    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [jobSearch, setJobSearch] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState('All');

    const filteredJobs = myJobs.filter(job => {
        const matchesSearch = job.campaign?.title?.toLowerCase().includes(jobSearch.toLowerCase());
        const matchesStatus = jobStatusFilter === 'All' || job.status === jobStatusFilter;
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        // Fetch applications initially to know what user has applied to (first page only for check)
        fetchMyApplications(true);
    }, []);

    useEffect(() => {
        if (activeTab === 'find') {
            const timer = setTimeout(() => {
                fetchCampaigns();
            }, 300);
            return () => clearTimeout(timer);
        } else if (activeTab === 'applications') {
            fetchMyApplications();
        } else if (activeTab === 'jobs') {
            fetchMyJobs();
        }
    }, [activeTab, search, platform, appsPage, appsStatusFilter]);

    const fetchCampaigns = async () => {
        setLoading(true);
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
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        setLoadingJobs(true);
        try {
            const response = await api.get('/job/my-jobs');
            setMyJobs(response.data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchMyApplications = async (initialCheck = false) => {
        // Don't show global loading if just background refreshing for "Explore" check
        if (activeTab === 'applications' && !initialCheck) setLoadingApps(true);
        
        try {
            const response = await api.get('/application/my-applications', {
                params: {
                    page: initialCheck ? 0 : appsPage,
                    size: initialCheck ? 100 : 10, // Fetch more for initial check to cover recent applications
                    status: appsStatusFilter === 'All' ? '' : appsStatusFilter
                }
            });
            
            // Handle Page response (content) vs List response (if backend not ready, but we updated it)
            const data = response.data.content ? response.data.content : response.data;
            const totalPages = response.data.totalPages || 0;

            if (initialCheck) {
                // Should we merge? For now just set if empty or if active tab is apps
                 if (activeTab === 'applications' || myApplications.length === 0) {
                     setMyApplications(data);
                     setAppsTotalPages(totalPages);
                 } else {
                     // For initial check, we just want to know if applied to update buttons. 
                     // But strictly speaking, if we don't store it, we can't check.
                     // So we update state.
                     setMyApplications(data); 
                 }
            } else {
                setMyApplications(data);
                setAppsTotalPages(totalPages);
            }

        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            if (activeTab === 'applications' && !initialCheck) setLoadingApps(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Receiver Dashboard</h1>
                    <p className="text-sm text-gray-500">Find jobs and monitor your earnings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`${activeTab === 'find' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                         Find Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`${activeTab === 'applications' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                         My Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                         Active Jobs
                    </button>
                </nav>
            </div>

            {activeTab === 'find' && (
                <>
                {/* Stats Cards (Static/Simulated for now) */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                        <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500 truncate">Earnings</p>
                            <p className="text-lg font-medium text-gray-900">$500.00</p>
                        </div>
                    </div>
                     <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500 truncate">Active Jobs</p>
                            <p className="text-lg font-medium text-gray-900">{myJobs.length > 0 ? myJobs.length : 4}</p>
                        </div>
                    </div>
                </div>

                {/* Campaign Discovery */}
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Explore Campaigns</h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                                <input 
                                    type="text"
                                    placeholder="Search campaigns..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <CustomSelect
                                    options={[
                                        { value: 'All', label: 'All Platforms' },
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
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                            No campaigns found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
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
                                                {campaign.platforms && campaign.platforms.map(p => (
                                                    <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        {p}
                                                    </span>
                                                ))}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Clock size={12} className="mr-1"/> 
                                                    {new Date(campaign.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {myApplications.some(app => app.campaign?.id === campaign.id) ? (
                                                <button 
                                                    disabled
                                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 opacity-80 cursor-not-allowed"
                                                >
                                                    <CheckCircle size={16} className="mr-2" /> Applied
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
                                                >
                                                    View Details & Apply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </>
            )}

            {activeTab === 'applications' && (
                 <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">My Applications</h2>
                        <div className="w-48">
                            <CustomSelect 
                                options={[
                                    { value: 'All', label: 'All Status' },
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'ACCEPTED', label: 'Accepted' },
                                    { value: 'REJECTED', label: 'Rejected' },
                                    { value: 'COMPLETED', label: 'Completed' }
                                ]}
                                value={appsStatusFilter}
                                onChange={setAppsStatusFilter}
                            />
                        </div>
                    </div>

                    {loadingApps ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : myApplications.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                            {appsStatusFilter === 'All' ? "You haven't applied to any campaigns yet." : "No applications found with this status."}
                        </div>
                    ) : (
                        <>
                            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
                                <ul className="divide-y divide-gray-200">
                                    {myApplications.map((app) => (
                                        <li key={app.id}>
                                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                         <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                                            {app.campaign?.images && app.campaign?.images.length > 0 ? (
                                                                <img src={app.campaign.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" />
                                                            ) : (
                                                                <Briefcase className="h-6 w-6 text-gray-400" />
                                                            )}
                                                         </div>
                                                         <div>
                                                             <p className="text-sm font-medium text-indigo-600 truncate">{app.campaign?.title}</p>
                                                             <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                 <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                                 <span>Applied on {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                             </div>
                                                         </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                            app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {app.status}
                                                        </span>
                                                        {app.bidAmount && (
                                                            <span className="text-sm text-gray-500 mt-1 font-medium">
                                                                Bid: ${app.bidAmount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {(app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'COMPLETED') && (
                                                    <div className={`mt-2 p-2 rounded text-xs ${
                                                        app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : 
                                                        app.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                        {app.status === 'ACCEPTED' && 'Congratulations! The creator has accepted your application.'}
                                                        {app.status === 'COMPLETED' && 'Job completed successfully!'}
                                                        {app.status === 'REJECTED' && 'Thank you for your interest. Unfortunately, the creator moved forward with other candidates.'}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Pagination */}
                            {appsTotalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2">
                                    <button
                                        onClick={() => setAppsPage(p => Math.max(0, p - 1))}
                                        disabled={appsPage === 0}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        Page {appsPage + 1} of {appsTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setAppsPage(p => Math.min(appsTotalPages - 1, p + 1))}
                                        disabled={appsPage === appsTotalPages - 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}



    // ...



    return (
        // ... (previous tabs)

            {activeTab === 'jobs' && (
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Active Jobs & Deliverables</h2>
                         <div className="flex gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                                <input 
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={jobSearch}
                                    onChange={(e) => setJobSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                                />
                            </div>
                            <div className="w-40 relative">
                                <CustomSelect 
                                    options={[
                                        { value: 'All', label: 'All Status' },
                                        { value: 'IN_PROGRESS', label: 'In Progress' },
                                        { value: 'COMPLETED', label: 'Completed' }
                                    ]}
                                    value={jobStatusFilter}
                                    onChange={setJobStatusFilter}
                                />
                            </div>
                        </div>
                    </div>

                    {loadingJobs ? (
                         <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                            {jobSearch || jobStatusFilter !== 'All' 
                                ? "No jobs found matching your filters."
                                : "You have no active jobs. Apply to campaigns to get started!"}
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {filteredJobs.map((job) => (
                                    <li key={job.id}>
                                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                                        {job.campaign.images && job.campaign.images.length > 0 ? (
                                                            <img src={job.campaign.images[0]} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <Briefcase className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-indigo-600 truncate">{job.campaign.title}</h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 gap-2">
                                                            <span className="flex items-center"><Clock size={14} className="mr-1"/> Started {new Date(job.createdAt).toLocaleDateString()}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            {job.price ? (
                                                                 <span className="font-medium text-gray-900">${job.price.toLocaleString()}</span>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Price not set</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center gap-3">
                                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                                        job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {job.status.replace('_', ' ')}
                                                    </span>
                                                    <button 
                                                        onClick={() => navigate(`/job/${job.id}`)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors shadow-sm"
                                                    >
                                                        Open Workspace
                                                    </button>
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
    );
};

export default ReceiverDashboard;
