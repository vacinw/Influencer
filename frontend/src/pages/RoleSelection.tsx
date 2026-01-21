import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, User } from 'lucide-react';

const RoleSelection = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (roleName: string) => {
        setLoading(true);
        try {
            const response = await api.post('/users/role', { role: roleName });
            if (response.status === 200) {
                // Refresh auth state or update user context
                login(response.data);
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to update role', error);
            // Handle error (toast etc)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-10 h-10 bg-black rounded-lg transform rotate-45"></div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Select your account type
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Choose how you want to use InfluConnect
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 px-4">
                    {/* Creator Card */}
                    <button
                        onClick={() => handleRoleSelect('CREATOR')}
                        disabled={loading}
                        className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-indigo-300 text-left"
                    >
                        <div>
                            <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white group-hover:bg-indigo-100 transition-colors">
                                <Briefcase className="h-6 w-6" aria-hidden="true" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium">
                                <span className="absolute inset-0" aria-hidden="true" />
                                I want to Hire (Creator)
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Find influencers, manage campaigns, and grow your brand.
                            </p>
                        </div>
                    </button>

                    {/* Receiver Card */}
                    <button
                        onClick={() => handleRoleSelect('RECEIVER')}
                        disabled={loading}
                        className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-green-300 text-left"
                    >
                        <div>
                            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white group-hover:bg-green-100 transition-colors">
                                <User className="h-6 w-6" aria-hidden="true" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium">
                                <span className="absolute inset-0" aria-hidden="true" />
                                I want to Work (KOL/Receiver)
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Monetize your influence and connect with top brands.
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
