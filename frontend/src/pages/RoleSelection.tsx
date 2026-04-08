import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, User, Loader2 } from 'lucide-react';

const RoleSelection = () => {
  const { user: currentUser, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user already has role, redirect accordingly
    if (currentUser?.role?.name === 'CREATOR') {
      navigate('/creator/dashboard');
    } else if (currentUser?.role?.name === 'RECEIVER') {
      navigate('/receiver/dashboard');
    }
  }, [currentUser, navigate]);

  const handleRoleSelect = async (roleName: string) => {
    setLoading(true);
    try {
      await api.post('/users/role', { role: roleName });
      // After role update, refresh auth state
      await checkAuth();
      // Navigate based on selected role
      if (roleName === 'CREATOR') {
        navigate('/creator/dashboard');
      } else {
        navigate('/receiver/dashboard');
      }
    } catch (error) {
      console.error('Failed to update role', error);
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
 Chọn loại tài khoản
 </h2>
 <p className="mt-2 text-center text-sm text-gray-600">
 Bạn muốn tham gia InfluConnect với tư cách nào?
 </p>
 </div>

 <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 px-4">
  {/* Creator Card */}
  <button
  onClick={() => handleRoleSelect('CREATOR')}
  disabled={loading}
  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-indigo-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
  >
  <div className="flex items-center">
  {loading ? (
    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
  ) : (
    <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white group-hover:bg-indigo-100 transition-colors">
      <Briefcase className="h-6 w-6" aria-hidden="true" />
    </span>
  )}
  <div className="ml-4">
    <h3 className="text-lg font-medium">
      Tôi muốn tìm Job (Nhà sáng tạo)
    </h3>
    <p className="mt-2 text-sm text-gray-500">
      Nhận job review, quản lý chiến dịch và phát triển thương hiệu cá nhân.
    </p>
  </div>
  </div>
  </button>

  {/* Receiver Card */}
  <button
  onClick={() => handleRoleSelect('RECEIVER')}
  disabled={loading}
  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-green-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
  >
  <div className="flex items-center">
  {loading ? (
    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
  ) : (
    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white group-hover:bg-green-100 transition-colors">
      <User className="h-6 w-6" aria-hidden="true" />
    </span>
  )}
  <div className="ml-4">
    <h3 className="text-lg font-medium">
      Tôi muốn thuê Influencer (Nhãn hàng)
    </h3>
    <p className="mt-2 text-sm text-gray-500">
      Đăng chiến dịch, tìm kiếm và kết nối với các KOL/Influencer hàng đầu.
    </p>
  </div>
  </div>
  </button>
  </div>
  </div>
  </div>
  );
};

export default RoleSelection;
