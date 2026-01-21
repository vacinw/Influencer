import { Calendar, Monitor, Hash, Clock, Share2, MessageCircle, Heart, User } from 'lucide-react';

interface CampaignData {
    title: string;
    description: string;
    images: string[];
    videos: string[];
    deadline: string;
    tags: string[]; // Might come as string or array depending on use, we'll normalize
    platforms: string[];
    creator?: {
        name: string;
        email: string;
    }
}

// Helper to normalize tags
const getTags = (tags: string | string[]) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') return tags.split(',').filter(t => t.trim() !== '');
    return [];
};

// 1. CLASSIC LAYOUT
export const ClassicLayout = ({ data }: { data: CampaignData }) => (
    <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden my-8">
        <div className="md:flex">
            <div className="md:w-2/3 p-8">
                <div className="flex items-center gap-2 text-indigo-600 font-medium mb-2">
                    <span className="bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">Campaign</span>
                    {data.platforms.map(p => (
                        <span key={p} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs border border-gray-200">{p}</span>
                    ))}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">{data.description}</p>
                
                {data.videos.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Promo Video</h3>
                        <video src={data.videos[0]} controls className="w-full rounded-lg shadow-sm" />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                    {getTags(data.tags).map((tag, i) => (
                        <span key={i} className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">#{tag.trim()}</span>
                    ))}
                </div>
            </div>
            
            <div className="md:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
                <div className="space-y-6">
                    {data.images.length > 0 && (
                        <img src={data.images[0]} alt="Main" className="w-full aspect-square object-cover rounded-lg shadow-sm mb-4" />
                    )}
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Deadline</h3>
                        <div className="flex items-center text-gray-900">
                            <Calendar size={18} className="mr-2 text-indigo-600"/>
                            <span className="font-semibold">{data.deadline ? new Date(data.deadline).toLocaleDateString() : 'No date set'}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Gallery</h3>
                        <div className="grid grid-cols-3 gap-2">
                             {data.images.slice(1, 7).map((img, idx) => (
                                 <img key={idx} src={img} className="w-full aspect-square object-cover rounded-md border border-gray-200" />
                             ))}
                        </div>
                    </div>

                    <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Apply Now
                    </button>
                    <p className="text-xs text-center text-gray-500">Contact: {data.creator?.email || 'Creator'}</p>
                </div>
            </div>
        </div>
    </div>
);

// 2. SHOWCASE LAYOUT
export const ShowcaseLayout = ({ data }: { data: CampaignData }) => (
    <div className="bg-black min-h-screen text-white pb-20">
        {/* Full Hero */}
        <div className="relative h-[60vh] w-full overflow-hidden">
            {data.images[0] ? (
                 <img src={data.images[0]} className="w-full h-full object-cover opacity-60" />
            ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-gray-700 font-bold text-4xl">NO IMAGE</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-10 md:p-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2 mb-4">
                        {data.platforms.map(p => (
                             <span key={p} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30">{p}</span>
                        ))}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">{data.title}</h1>
                    <div className="flex items-center text-gray-300 gap-4">
                        <span className="flex items-center"><Clock size={18} className="mr-1"/> Ends {data.deadline ? new Date(data.deadline).toLocaleDateString() : 'N/A'}</span>
                        <span className="flex items-center"><User size={18} className="mr-1"/> by {data.creator?.name || 'Creator'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-0 -mt-10 relative z-10">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl mb-12">
                <p className="text-xl leading-relaxed text-gray-300">{data.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {data.videos.map((vid, i) => (
                    <div key={i} className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                        <video src={vid} controls className="w-full h-full object-cover" />
                    </div>
                ))}
                {data.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                         <img src={img} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    </div>
                ))}
            </div>
            
            <div className="text-center">
                 <button className="bg-white text-black px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-200 transition-colors">
                    Join Campaign
                </button>
            </div>
        </div>
    </div>
);

// 3. SOCIAL LAYOUT
export const SocialLayout = ({ data }: { data: CampaignData }) => (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white text-center">
            <h2 className="text-sm font-bold opacity-80 uppercase tracking-widest">Influencer Opportunity</h2>
            <h1 className="text-3xl font-extrabold mt-2">{data.title}</h1>
        </div>
        
        <div className="p-6">
            <div className="flex items-center justify-center space-x-6 mb-8 border-b border-gray-100 pb-6">
                 {data.platforms.map(p => (
                    <div key={p} className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                            {p[0]}
                        </div>
                        <span className="text-xs font-medium mt-1 text-gray-600">{p}</span>
                    </div>
                 ))}
            </div>

            <div className="prose prose-sm mx-auto text-center text-gray-600 mb-8">
                 {data.description}
            </div>

            <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
                 {data.images[0] && <img src={data.images[0]} className="w-full h-full object-cover" />}
                 <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="bg-white/90 p-2 rounded-full shadow text-pink-500"><Heart size={20} fill="currentColor"/></button>
                    <button className="bg-white/90 p-2 rounded-full shadow text-blue-500"><MessageCircle size={20}/></button>
                    <button className="bg-white/90 p-2 rounded-full shadow text-black"><Share2 size={20}/></button>
                 </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
                {getTags(data.tags).map((t, i) => (
                    <span key={i} className="text-blue-500 font-medium">#{t.trim()}</span>
                ))}
            </div>

            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-md transform active:scale-95 transition-all">
                I'm Interested!
            </button>
        </div>
    </div>
);

// 4. MINIMAL LAYOUT
export const MinimalLayout = ({ data }: { data: CampaignData }) => (
    <div className="max-w-3xl mx-auto my-20 px-8">
        <div className="border-b border-black pb-8 mb-8">
            <div className="flex justify-between items-end">
                <h1 className="text-5xl font-light tracking-tighter text-black">{data.title}</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Deadline</p>
                    <p className="font-mono">{data.deadline}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
                <p className="text-sm font-bold uppercase tracking-widest mb-4">Specs</p>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-gray-400">Platforms</p>
                        <p className="font-medium">{data.platforms.join(', ')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Host</p>
                        <p className="font-medium">{data.creator?.name || 'Unknown'}</p>
                    </div>
                </div>
            </div>
            
            <div className="col-span-8">
                 <p className="text-xl font-serif leading-relaxed text-gray-800 mb-8">{data.description}</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                     {data.images.map((img, i) => (
                         <img key={i} src={img} className="w-full grayscale hover:grayscale-0 transition-all duration-500" />
                     ))}
                 </div>
            </div>
        </div>
    </div>
);
