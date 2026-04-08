import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

interface Banner {
 id: number;
 imageUrl: string;
 videoUrl?: string;
 type: string;
 targetUrl: string;
}

const BannerCarousel = () => {
 const [banners, setBanners] = useState<Banner[]>([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isHovered, setIsHovered] = useState(false);

 useEffect(() => {
 const fetchBanners = async () => {
 try {
 const res = await api.get('/banners/active');
 setBanners(res.data);
 } catch (error) {
 console.error('Failed to fetch banners', error);
 }
 };
 fetchBanners();
 }, []);

 useEffect(() => {
 if (banners.length <= 1 || isHovered) return;
 const timer = setInterval(() => {
 setCurrentIndex((prev) => (prev + 1) % banners.length);
 }, 5000);
 return () => clearInterval(timer);
 }, [banners.length, isHovered]);

 const prevSlide = () => {
 setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
 };

 const nextSlide = () => {
 setCurrentIndex((prev) => (prev + 1) % banners.length);
 };

 const getYouTubeId = (url: string) => {
 if (!url) return null;
 const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
 return match ? match[1] : null;
 };

 if (banners.length === 0) return null;

 return (
 <div
 className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-900 group"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 <div
 className="flex transition-transform duration-700 ease-in-out h-full"
 style={{ transform: `translateX(-${currentIndex * 100}%)` }}
 >
 {banners.map((banner) => (
 <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
 {banner.type === 'YOUTUBE' && banner.videoUrl ? (
 <iframe
 className="w-full h-full"
 src={`https://www.youtube.com/embed/${getYouTubeId(banner.videoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(banner.videoUrl)}&controls=1`}
 title="YouTube video player"
 frameBorder="0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 ></iframe>
 ) : banner.targetUrl ? (
 <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group/banner overflow-hidden cursor-pointer">
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
 <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover transform transition-transform duration-700 group-hover/banner:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x500?text=Invalid+Image'; }} />
 </a>
 ) : (
 <div className="block w-full h-full relative group/banner overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none"></div>
 <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover transform transition-transform duration-700 group-hover/banner:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x500?text=Invalid+Image'; }} />
 </div>
 )}
 </div>
 ))}
 </div>

 {banners.length > 1 && (
 <>
 <button
 onClick={prevSlide}
 className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
 >
 <ChevronLeft size={28} />
 </button>
 <button
 onClick={nextSlide}
 className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
 >
 <ChevronRight size={28} />
 </button>
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
 {banners.map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentIndex(index)}
 className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
 aria-label={`Go to slide ${index + 1}`}
 />
 ))}
 </div>
 </>
 )}
 </div>
 );
};

export default BannerCarousel;
