import { Plus, Search, Calendar, BarChart2, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    applicantCount?: number;
}

interface PageResponse {
    content: Campaign[];
    totalPages: number;
    totalElements: number;
    number: number; // current page
}

const CreatorDashboard = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filter State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [totalCampaigns, setTotalCampaigns] = useState(0);

    const [activeTab, setActiveTab] = useState('campaigns');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [jobSearch, setJobSearch] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState('All');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.campaign?.title?.toLowerCase().includes(jobSearch.toLowerCase()) || 
                              job.influencer?.username?.toLowerCase().includes(jobSearch.toLowerCase());
        const matchesStatus = jobStatusFilter === 'All' || job.status === jobStatusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- Helper Functions (Defined before use) ---

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await api.get('/campaign/my-campaigns', {
                params: {
                    page: page,
                    size: 5,
                    status: statusFilter === 'All' ? '' : statusFilter,
                    search: searchQuery
                }
            });
            // Backend returns Page<Campaign>
            const data: PageResponse = response.data;
            setCampaigns(data.content);
            setTotalPages(data.totalPages);
            setTotalCampaigns(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        setLoadingJobs(true);
        try {
            const response = await api.get('/job/my-jobs');
            setJobs(response.data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoadingJobs(false);
        }
    };

    // --- Effects ---

    // Auto-sync jobs to fix data inconsistencies
    useEffect(() => {
        const syncAndRefresh = async () => {
            try {
                const res = await api.post('/application/sync-jobs');
                if (res.data.syncedCount > 0) {
                     // always refresh jobs if we synced something, regardless of tab
                     // But strictly speaking we only need to if tab is jobs.
                     // However, better to just let fetchJobs run if tab is jobs.
                     // The logic below 'if activeTab === jobs' handles it?
                     // Wait, activeTab effect runs independently.
                     console.log(`Synced ${res.data.syncedCount} missing jobs.`);
                     if (activeTab === 'jobs') fetchJobs(); 
                }
            } catch (err) {
                console.error("Sync failed", err);
            }
        };
        syncAndRefresh();
    }, [activeTab]); // Trigger on tab change? No, usually once on mount is enough but if user switches back and forth we might want to check again? 
    // Actually simpler: run once on mount. If user switches to jobs tab, the other effect runs.
    // BUT we want to force refresh if sync created new jobs while user was ALREADY on jobs tab (unlikely on mount, unless refreshed).
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'campaigns') fetchCampaigns();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, statusFilter, searchQuery, activeTab]);

    useEffect(() => {
        if (activeTab === 'jobs') fetchJobs();
    }, [activeTab]);

    // --- Handlers ---

    const handleRefreshJobs = () => {
        fetchJobs();
    };

    const totalApplicants = campaigns.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
                    <p className="text-sm text-gray-500">Manage your campaigns and find influencers</p>
                </div>
                <div>
                    <Link to="/creator/campaigns/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-5 w-5 mr-2" />
                        New Campaign
                    </Link>
                </div>
            </div>

            <div className="border-b border-gray-200 flex justify-between items-center">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`${activeTab === 'campaigns' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                         Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                         Active Contracts
                    </button>
                </nav>
                 {activeTab === 'jobs' && (
                    <button onClick={handleRefreshJobs} className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 mr-2">
                        Refresh List
                    </button>
                )}
            </div>

            {activeTab === 'campaigns' ? (
                <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Active Campaigns Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                                    <Calendar className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{totalCampaigns}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                             <div className="bg-gray-50 px-5 py-3 mt-5 -mx-5 -mb-5">
                                <div className="text-sm">
                                    <span className="font-medium text-indigo-600">View performance</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Influencers Found Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                                    <Search className="h-6 w-6 text-green-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Influencer Discovery</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">Find Talent</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 mt-5 -mx-5 -mb-5">
                                <div className="text-sm">
                                    <Link to="/explore" className="font-medium text-indigo-600 hover:text-indigo-500">Search Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROI Stats Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
                                    <BarChart2 className="h-6 w-6 text-purple-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Applicants</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{totalApplicants}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 mt-5 -mx-5 -mb-5">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">View Analytics</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campaign List */}
                <div className="bg-white shadow sm:rounded-md mt-6">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Campaigns</h3>
                        
                        {/* Filters */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                                <input 
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="w-40 relative">
                                 <CustomSelect
                                    options={[
                                        { value: 'All', label: 'All Status' },
                                        { value: 'Đang tuyển', label: 'Hiring' },
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Completed', label: 'Completed' }
                                    ]}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No campaigns found matching your criteria.
                        </div>
                    ) : (
                        <>
                        <ul className="divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                                <li key={campaign.id}>
                                    <div 
                                        onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                                        className="block hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {/* Thumbnail if available */}
                                                    {campaign.images && campaign.images.length > 0 ? (
                                                         <img src={campaign.images[0]} alt="" className="h-12 w-12 rounded-md object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                                            <Calendar size={20} className="text-gray-400"/>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-indigo-600 truncate">{campaign.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">{campaign.description}</p>
                                                        <div className="flex gap-1 mt-1">
                                                            {campaign.platforms && campaign.platforms.map((p: string) => (
                                                                <span key={p} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                                                                    {p}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex flex-col items-end gap-2">
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        campaign.status === 'Đang tuyển' || campaign.status === 'Active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {campaign.status}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                                        {campaign.layoutStyle || 'Classic'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        <span className="font-bold text-indigo-600 mr-1">{campaign.applicantCount || 0}</span> Applicants
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                    <p>Closing on <time dateTime={campaign.deadline}>{new Date(campaign.deadline).toLocaleDateString()}</time></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* Pagination Controls */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={page >= totalPages - 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                </div>
                </> 
            ) : (
                <div className="mt-8">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Active Contracts & Milestones</h2>
                        
                        <div className="flex gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                                <input 
                                    type="text"
                                    placeholder="Search contracts..."
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
                            <button onClick={handleRefreshJobs} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md" title="Refresh">
                                <Loader2 size={20} className={loadingJobs ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {loadingJobs ? (
                         <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                             {jobSearch || jobStatusFilter !== 'All' 
                                ? "No contracts found matching your filters."
                                : "You have no active contracts yet. Accept applications to start jobs!"}
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {filteredJobs.map((job) => (
                                    <li key={job.id}>
                                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 h-16 w-16 bg-purple-100 rounded-md overflow-hidden border border-gray-200">
                                                         {job.campaign.images && job.campaign.images.length > 0 ? (
                                                            <img src={job.campaign.images[0]} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <BarChart2 className="h-8 w-8 text-purple-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900">{job.campaign.title}</h3>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <span className="flex items-center mr-3">
                                                                <Users size={14} className="mr-1"/> 
                                                                {job.influencer?.fullName || job.influencer?.username}
                                                            </span>
                                                            {/* <span className="flex items-center"><Clock size={14} className="mr-1"/> Since {new Date(job.createdAt).toLocaleDateString()}</span> */}
                                                        </div>
                                                         <div className="flex items-center text-xs text-gray-400 mt-1">
                                                            Started {new Date(job.createdAt).toLocaleDateString()}
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
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none shadow-sm transition-colors"
                                                    >
                                                        Manage
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

export default CreatorDashboard;
