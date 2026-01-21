import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Upload, Calendar, Hash, Monitor, X, Image as ImageIcon, Video, Loader2, Layout, CheckCircle, Eye, Edit2 } from 'lucide-react';
import { ClassicLayout, ShowcaseLayout, SocialLayout, MinimalLayout } from '../../components/layouts/CampaignLayouts';
import { useAuth } from '../../context/AuthContext';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        images: [] as string[],
        videos: [] as string[],
        deadline: '',
        tags: '',
        platforms: [] as string[],
        layoutStyle: 'CLASSIC' // Default
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [isPreview, setIsPreview] = useState(false); // New state for preview mode

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const layouts = [
        { id: 'CLASSIC', name: 'Classic Standard', description: 'Traditional split view. Best for detailed text descriptions with a side gallery of 1-6 images.', color: 'bg-gray-100' },
        { id: 'SHOWCASE', name: 'Visual Showcase', description: 'Immersive experience. Features a full-screen hero banner and wide masonry grid. Perfect for high-quality visuals.', color: 'bg-indigo-50' },
        { id: 'SOCIAL', name: 'Social First', description: 'Mobile-app style. Highlights platforms (TikTok, IG) and engagement metrics. Great for influencer-focused briefs.', color: 'bg-pink-50' },
        { id: 'MINIMAL', name: 'Minimalist', description: 'Clean and editorial. Focuses purely on typography and the "Apply" action. Images are subtle grayscale until hovered.', color: 'bg-white border' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlatformChange = (platform: string) => {
        setFormData(prev => {
            if (prev.platforms.includes(platform)) {
                return { ...prev, platforms: prev.platforms.filter(p => p !== platform) };
            } else {
                return { ...prev, platforms: [...prev.platforms, platform] };
            }
        });
    };

    const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(response.data.url);
            }

            setFormData(prev => ({
                ...prev,
                [type === 'image' ? 'images' : 'videos']: [
                    ...prev[type === 'image' ? 'images' : 'videos'],
                    ...uploadedUrls
                ]
            }));

        } catch (err) {
            console.error(err);
            setError('Failed to upload media. Please try again.');
        } finally {
            setUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    const removeMedia = (url: string, type: 'image' | 'video') => {
        setFormData(prev => ({
            ...prev,
            [type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].filter(item => item !== url)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            
            const payload = {
                title: formData.title,
                description: formData.description,
                images: formData.images,
                videos: formData.videos,
                deadline: formData.deadline,
                tags: tagsArray,
                platforms: formData.platforms,
                layoutStyle: formData.layoutStyle
            };

            await api.post('/campaign/create', payload);
            navigate('/creator/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Failed to create campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render current layout preview
    const renderPreview = () => {
        const previewData = { ...formData, tags: formData.tags.split(','), creator: { name: user?.name || 'You', email: user?.email || 'email@example.com' } };
        switch(formData.layoutStyle) {
            case 'SHOWCASE': return <ShowcaseLayout data={previewData} />;
            case 'SOCIAL': return <SocialLayout data={previewData} />;
            case 'MINIMAL': return <MinimalLayout data={previewData} />;
            default: return <ClassicLayout data={previewData} />;
        }
    };

    if (isPreview) {
        return (
            <div className="bg-gray-100 min-h-screen pb-20">
                 <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Eye size={20} className="text-indigo-600"/> Live Preview: <span className="text-indigo-600">{layouts.find(l => l.id === formData.layoutStyle)?.name}</span>
                    </h2>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => setIsPreview(false)}
                            className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Edit2 size={16}/> Continue Editing
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                        >
                             {loading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                             Publish Now
                        </button>
                    </div>
                </div>
                {renderPreview()}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="ml-1">Back</span>
                </button>
                <button 
                    onClick={() => setIsPreview(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                    <Eye size={18}/> Preview Layout
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Create New Campaign</h1>
                        <p className="text-gray-500 text-sm mt-1">Design a visually stunning campaign to attract top influencers.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* ... (Existing Form Content) ... */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    {/* Section 0: Layout Selection */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                             <Layout size={20} /> Select Layout Style
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {layouts.map(layout => (
                                <div 
                                    key={layout.id}
                                    onClick={() => setFormData({ ...formData, layoutStyle: layout.id })}
                                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                        formData.layoutStyle === layout.id 
                                            ? 'border-black bg-gray-50 ring-1 ring-black' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {formData.layoutStyle === layout.id && (
                                        <div className="absolute top-2 right-2 text-black">
                                            <CheckCircle size={18} fill="black" className="text-white"/>
                                        </div>
                                    )}
                                    <div className={`h-20 w-full rounded-md mb-3 ${layout.color}`}></div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{layout.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Details</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-lg placeholder-gray-400"
                                placeholder="e.g. Summer Glow Skincare Launch"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={5}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none text-base placeholder-gray-400"
                                placeholder="Describe your brand, the campaign goals, and what you expect from influencers..."
                            />
                        </div>
                    </div>

                    {/* Section 2: Media Gallery */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex justify-between items-center">
                            <span>Media Gallery</span>
                            {uploading && <span className="text-sm font-normal text-indigo-600 flex items-center"><Loader2 className="animate-spin mr-1" size={16}/> Uploading...</span>}
                        </h2>
                        
                        {/* Images Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Images</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                {formData.images.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                        <img src={url} alt={`Campaign ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(url, 'image')}
                                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600"
                                >
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                    <span className="text-xs mt-2 font-medium">Add Images</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={imageInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => handleFileUpload(e.target.files, 'image')} 
                            />
                            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP. Max 5MB per file.</p>
                        </div>

                        {/* Video Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Promotional Video (Optional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                {formData.videos.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black">
                                        <video src={url} className="w-full h-full object-cover" controls />
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(url, 'video')}
                                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {formData.videos.length === 0 && (
                                    <div 
                                        onClick={() => videoInputRef.current?.click()}
                                        className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600"
                                    >
                                        <Video size={32} strokeWidth={1.5} />
                                        <span className="text-xs mt-2 font-medium">Add Video</span>
                                    </div>
                                )}
                            </div>
                             <input 
                                type="file" 
                                ref={videoInputRef} 
                                className="hidden" 
                                accept="video/*" 
                                onChange={(e) => handleFileUpload(e.target.files, 'video')} 
                            />
                             <p className="text-xs text-gray-500">Supported formats: MP4, MOV. Max 50MB.</p>
                        </div>
                    </div>

                    {/* Section 3: Targeting & Logistics */}
                    <div className="space-y-6">
                         <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Targeting & Logistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2"><Calendar size={18} className="text-gray-400"/> Application Deadline</span>
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    required
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2"><Hash size={18} className="text-gray-400"/> Tags / Keywords</span>
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                    placeholder="fashion, lifestyle, summer..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <span className="flex items-center gap-2"><Monitor size={18} className="text-gray-400"/> Required Platforms</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter'].map(platform => (
                                    <button
                                        key={platform}
                                        type="button"
                                        onClick={() => handlePlatformChange(platform)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                                            formData.platforms.includes(platform)
                                                ? 'bg-black text-white border-black shadow-md transform -translate-y-0.5'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>}
                            {loading ? 'Creating Campaign...' : 'Publish Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCampaign;
