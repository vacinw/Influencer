import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Link as LinkIcon, Edit3, ShieldCheck, Mail, Phone, Camera, Loader2 } from 'lucide-react';

const ProfilePage = () => {
    const { user: initialUser, checkAuth } = useAuth();
    const [user, setUser] = useState<any>(initialUser);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        avatarUrl: '',
        socialLinks: ['']
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setUser(res.data);
            setFormData({
                name: res.data.name || '',
                bio: res.data.bio || '',
                phone: res.data.phone || '',
                avatarUrl: res.data.avatarUrl || '',
                socialLinks: res.data.socialLinks && res.data.socialLinks.length > 0 ? res.data.socialLinks : ['']
            });
        } catch (error) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/users/profile', formData);
            setIsEditing(false);
            fetchProfile();
            await checkAuth();
        } catch (error) {
            alert("Failed to update profile");
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, avatarUrl: res.data.url });
            await checkAuth();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[50vh]">
                 <p className="text-gray-500 mb-4">You must be logged in to view your profile.</p>
                 <a href="/login" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                     Go to Login
                 </a>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Cover Image (Mock) */}
            <div className="h-60 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute bottom-4 right-4">
                     {/* Cover Edit Button Placeholder */}
                </div>
            </div>

            {/* Profile Header */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20 sm:flex sm:items-end sm:space-x-5">
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-full ring-4 ring-white bg-white overflow-hidden relative">
                            {formData.avatarUrl || user.avatarUrl ? (
                                <img src={isEditing ? formData.avatarUrl : user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                    <User size={64} className="text-gray-400" />
                                </div>
                            )}
                            
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-white" />
                                </div>
                            )}
                            
                            {isEditing && !isUploading && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" />
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*"/>
                                </label>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-between sm:pb-2">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 truncate flex items-center gap-2">
                                {user.name}
                                {user.isVerified && <ShieldCheck className="text-blue-500 fill-blue-100" size={24} />}
                            </h1>
                            <p className="text-sm font-medium text-gray-500">{user.role?.name}</p>
                        </div>
                        <div className="mt-4 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleSave} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Save</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    <Edit3 size={16} className="mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
                    {/* Left Column (Info) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                                    {['about', 'reviews'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            
                            <div className="p-6">
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900">Bio</h3>
                                            {isEditing ? (
                                                <textarea 
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    rows={4}
                                                    value={formData.bio}
                                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                                />
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-600">{user.bio || "No bio added yet."}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Social Links</h3>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    {formData.socialLinks.map((link, idx) => (
                                                        <input 
                                                            key={idx}
                                                            type="text"
                                                            value={link}
                                                            onChange={e => {
                                                                const newLinks = [...formData.socialLinks];
                                                                newLinks[idx] = e.target.value;
                                                                setFormData({...formData, socialLinks: newLinks});
                                                            }}
                                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                            placeholder="https://..."
                                                        />
                                                    ))}
                                                    <button 
                                                        onClick={() => setFormData({...formData, socialLinks: [...formData.socialLinks, '']})}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        + Add another link
                                                    </button>
                                                </div>
                                            ) : (
                                                <ul className="space-y-1">
                                                    {user.socialLinks?.map((link: string, idx: number) => (
                                                        <li key={idx} className="flex items-center text-sm text-blue-600">
                                                            <LinkIcon size={14} className="mr-2 text-gray-400" />
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">{link}</a>
                                                        </li>
                                                    ))}
                                                    {(!user.socialLinks || user.socialLinks.length === 0) && <p className="text-sm text-gray-500">No links added.</p>}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {activeTab === 'reviews' && (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-400">
                                            <ShieldCheck size={48} />
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">Reviews and ratings will appear here once you complete jobs.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Contact/Private Status) */}
                    <div className="space-y-6 lg:col-span-1">
                         <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={16} className="mr-2 text-gray-400" />
                                    {user.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone size={16} className="mr-2 text-gray-400" />
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="border-b border-gray-300 focus:border-blue-500 outline-none"
                                            placeholder="+84..."
                                        />
                                    ) : (
                                        <span>{user.phone || "Not provided"}</span>
                                    )}
                                </div>
                            </div>
                         </div>
                         
                         {/* Verification Status Card */}
                         <div className="bg-white shadow rounded-lg p-6">
                             <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Verification</h3>
                             {user.isVerified ? (
                                 <div className="flex items-start">
                                     <ShieldCheck className="text-green-500 mr-2 mt-0.5" />
                                     <div>
                                         <p className="font-medium text-gray-900">Identity Verified</p>
                                         <p className="text-sm text-gray-500">You are a trusted member of the community.</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="text-center">
                                     <p className="text-sm text-gray-600 mb-4">Verify your identity to build trust and unlock more features.</p>
                                     <a href="/verification" className="block w-full bg-blue-50 text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                         Get Verified Now
                                     </a>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
