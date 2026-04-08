import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, User, X, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import NotificationDropdown from './NotificationDropdown';

const Header = () => {
 const { user, isAuthenticated, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const profileMenuRef = useRef<HTMLDivElement>(null);

 const isActive = (path: string) => {
 if (path === '/') return location.pathname === '/';
 return location.pathname.startsWith(path);
 };

 const getLinkClass = (path: string) => {
 return isActive(path) 
 ? "bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
 : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
 };

 const getMobileLinkClass = (path: string) => {
 return isActive(path)
 ? "bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-3 border-l-4 text-base font-semibold transition-colors"
 : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors";
 };

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
 setIsProfileOpen(false);
 }
 };

 document.addEventListener('mousedown', handleClickOutside);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, []);

 const handleLogout = async () => {
 await logout();
 navigate('/login');
 };

 return (
 <header className="bg-white border-b border-gray-100 fixed w-full top-0 z-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between h-16">
 {/* Brand */}
 <div className="flex">
 <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
 <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-md shadow-indigo-200">
 <Sparkles className="text-white w-5 h-5 flex-shrink-0" />
 </div>
 <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-800 tracking-tight">InfluConnect</span>
 {isAuthenticated && user?.role?.name && (
 <span className={`hidden sm:inline-flex ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
 user.role.name === 'CREATOR' ? 'bg-indigo-50 text-indigo-700' :
 user.role.name === 'RECEIVER' ? 'bg-emerald-50 text-emerald-700' :
 'bg-purple-50 text-purple-700'
 }`}>
 {user.role.name === 'CREATOR' ? 'Brand' : user.role.name === 'RECEIVER' ? 'Influencer' : 'Admin'}
 </span>
 )}
 </Link>

 {/* Desktop Nav */}
 <div className="hidden sm:ml-10 sm:flex sm:items-center sm:space-x-2">
 <Link to="/" className={getLinkClass('/')}>
 Trang Chủ
 </Link>
 <Link to="/explore" className={getLinkClass('/explore')}>
 Khám Phá
 </Link>

 {user?.role?.name === 'CREATOR' && (
 <>
 <Link to="/creator/dashboard" className={getLinkClass('/creator/dashboard')}>Bảng Điều Khiển</Link>
 <Link to="/wallet" className={getLinkClass('/wallet')}>Ví</Link>
 </>
 )}
 {user?.role?.name === 'RECEIVER' && (
 <>
 <Link to="/receiver/dashboard" className={getLinkClass('/receiver/dashboard')}>Bảng Điều Khiển</Link>
 <Link to="/wallet" className={getLinkClass('/wallet')}>Ví</Link>
 </>
 )}
 {user?.role?.name === 'ADMIN' && (
 <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}>Quản Trị</Link>
 )}
 </div>
 </div>

 {/* Right Side Actions */}
 <div className="hidden sm:ml-6 sm:flex sm:items-center">
 {isAuthenticated ? (
 <div className="flex items-center space-x-4">
 <NotificationDropdown />
 <div className="ml-3 relative" ref={profileMenuRef}>
 <div>
 <button
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none "
 >
 <span className="sr-only">Open user menu</span>
 {user?.avatarUrl ? (
 <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
 ) : (
 <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
 <User size={18} />
 </div>
 )}
 <span className="ml-2 text-gray-700 font-medium">{user?.name}</span>
 <ChevronDown size={16} className="ml-1 text-gray-400" />
 </button>
 </div>
 {
 isProfileOpen && (
 <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white border border-gray-100 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
 <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
 Đăng nhập dưới tên <br /> <strong className="text-gray-900 block truncate" title={user?.email}>{user?.email}</strong>
 </div>
 <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ Sơ Của Bạn</Link>
 <Link to="/verification" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Trạng Thái Xác Minh</Link>
 <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Đổi Mật Khẩu</Link>
 <button
 onClick={handleLogout}
 className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
 >
 Đăng Xuất
 </button>
 </div>
 )
 }
 </div>
 </div>
 ) : (
 <div className="flex items-center space-x-4">
 <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Đăng Nhập</Link>
 <Link to="/register" className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
 Đăng Ký
 </Link>
 </div>
 )}
 </div>

 {/* Mobile menu button */}
 <div className="-mr-2 flex items-center sm:hidden">
 <button
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none -inset "
 >
 <span className="sr-only">Open main menu</span>
 {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Menu */}
 {isMenuOpen && (
 <div className="sm:hidden bg-white border-t border-gray-100">
 <div className="pt-2 pb-3 space-y-1">
 <Link to="/" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/')}>Trang Chủ</Link>
 <Link to="/explore" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/explore')}>Khám Phá</Link>
 {user?.role?.name === 'CREATOR' && (
 <>
 <Link to="/creator/dashboard" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/creator/dashboard')}>Bảng Điều Khiển</Link>
 <Link to="/wallet" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/wallet')}>Ví</Link>
 </>
 )}
 {user?.role?.name === 'RECEIVER' && (
 <>
 <Link to="/receiver/dashboard" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/receiver/dashboard')}>Bảng Điều Khiển</Link>
 <Link to="/wallet" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/wallet')}>Ví</Link>
 </>
 )}
 {user?.role?.name === 'ADMIN' && (
 <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/admin/dashboard')}>Quản Trị</Link>
 )}
 </div>
 <div className="pt-4 pb-3 border-t border-gray-200">
 {isAuthenticated ? (
 <div className="flex items-center px-4">
 <div className="flex-shrink-0">
 {user?.avatarUrl ? (
 <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
 ) : (
 <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
 <User size={20} />
 </div>
 )}
 </div>
 <div className="ml-3">
 <div className="text-base font-medium text-gray-800">{user?.name}</div>
 <div className="text-sm font-medium text-gray-500">{user?.email}</div>
 </div>
 <div className="ml-auto flex items-center space-x-2">
 <NotificationDropdown />
 <button onClick={handleLogout} className="flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
 <LogOut size={20} />
 </button>
 </div>
 </div>
 ) : (
 <div className="mt-3 space-y-1 px-2">
 <Link to="/login" className="block text-center w-full px-4 py-2 text-base font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md">
 Đăng Nhập
 </Link>
 <Link to="/register" className="block text-center w-full px-4 py-2 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-md mt-2">
 Đăng Ký
 </Link>
 </div>
 )}
 </div>
 </div>
 )}
 </header>
 );
};

export default Header;
