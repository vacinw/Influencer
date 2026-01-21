import { Briefcase, DollarSign, Star, Clock } from 'lucide-react';

const ReceiverDashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Receiver Dashboard</h1>
                    <p className="text-sm text-gray-500">Monitor your jobs and earnings</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Earnings</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">$500.00</div>
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
                                <Briefcase className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">4</div>
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
                                <Star className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Rating</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">4.9/5.0</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Campaigns/Jobs */}
            <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8">Recommended Campaigns</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Tech
                                </span>
                                <span className="text-sm text-gray-500 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" /> 2 days left
                                </span>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Tech Gadget Review Series</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                We are looking for tech enthusiasts to review our latest wireless earbuds. High engagement required.
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">$250</span>
                                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReceiverDashboard;
