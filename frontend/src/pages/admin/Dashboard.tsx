import { Users, ShoppingBag, DollarSign, Activity, ShieldCheck, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api'; // Ensure you have this configured

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

    useEffect(() => {
        if (activeTab === 'verifications') {
            fetchVerificationRequests();
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
        const note = prompt("Reason for rejection:");
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('verifications')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'verifications' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                         Verification Requests
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
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">24,589</div>
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
                                            <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">1,240</div>
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
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">$4.5M</div>
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
                                            <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-green-600">99.9%</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity / Users Table Placeholder */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Registrations</h3>
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {/* Static Dummy Data */}
                                                    <tr>
                                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">Jane Cooper</div></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Creator</span></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">Active</span></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">2024-01-14</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">Cody Fisher</div></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Receiver</span></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">Active</span></td>
                                                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">2024-01-14</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'verifications' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Pending Verification Requests</h3>
                        <button onClick={fetchVerificationRequests} className="text-sm text-indigo-600 hover:text-indigo-900">Refresh</button>
                    </div>
                    {loadingVerifications ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : verificationRequests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">All caught up! No pending requests.</div>
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
                                                <p className="text-xs text-gray-500">{req.user.role.name} • {req.user.email}</p>
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
                                                <ExternalLink size={14} className="mr-2"/> View Doc
                                            </a>
                                            <button 
                                                onClick={() => handleReject(req.id)}
                                                disabled={processingId === req.id}
                                                className="flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded disabled:opacity-50"
                                            >
                                                <X size={14} className="mr-1"/> Reject
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(req.id)}
                                                disabled={processingId === req.id}
                                                className="flex items-center px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                                            >
                                                {processingId === req.id ? <Loader2 size={14} className="animate-spin mr-1"/> : <Check size={14} className="mr-1"/>}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
