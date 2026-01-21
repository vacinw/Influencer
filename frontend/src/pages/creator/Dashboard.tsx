import { Plus, Search, Calendar, BarChart2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreatorDashboard = () => {
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">3 Running</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 mt-5 -mx-5 -mb-5">
                            <div className="text-sm">
                                <Link to="/creator/campaigns" className="font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reach</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">1.2M</div>
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
            <div className="bg-white shadow sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Your Campaigns</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {/* Dummy Campaign Items */}
                    {[1, 2, 3].map((i) => (
                        <li key={i}>
                            <a href="#" className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-600 truncate">Summer Fashion Launch 2024</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                12 Influencers hired
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <p>Closing on <time dateTime="2024-06-01">June 1, 2024</time></p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CreatorDashboard;
