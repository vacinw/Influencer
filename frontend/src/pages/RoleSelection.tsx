import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, User, Loader2 } from 'lucide-react';

const RoleSelection = () => {
  const { user: currentUser, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role?.name === 'CREATOR') {
      navigate('/creator/dashboard');
    } else if (currentUser?.role?.name === 'RECEIVER') {
      navigate('/receiver/dashboard');
    }
  }, [currentUser, navigate]);

  const handleRoleSelect = async (roleName: string) => {
    if (loading) return;
    
    setLoading(true);
    setSelectedRole(roleName);
    
    try {
      console.log('Calling API with role:', roleName);
      const response = await api.post('/users/role', { role: roleName });
      console.log('API Response:', response.data);
      console.log('API Response role:', response.data.role?.name);
      
      // Refresh auth state
      await checkAuth();
      
      // Navigate based on selected role
      // CREATOR = Nhãn hàng (Brand)
      // RECEIVER = Nhà sáng tạo (Influencer)
      if (roleName === 'RECEIVER') {
        navigate('/receiver/dashboard');
      } else {
        navigate('/creator/dashboard');
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      alert('Có lỗi xảy ra: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
      setSelectedRole(null);
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
          {/* Influencer Card - Nhà sáng tạo = RECEIVER */}
          <button
            onClick={() => handleRoleSelect('RECEIVER')}
            disabled={loading}
            className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-indigo-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center">
              {loading && selectedRole === 'RECEIVER' ? (
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              ) : (
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
                  <Briefcase className="h-8 w-8" />
                </span>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Tôi muốn tìm Job (Nhà sáng tạo)
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Nhận job review, quản lý chiến dịch và phát triển thương hiệu cá nhân.
                </p>
              </div>
            </div>
          </button>

          {/* Brand Card - Nhãn hàng = CREATOR */}
          <button
            onClick={() => handleRoleSelect('CREATOR')}
            disabled={loading}
            className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-green-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center">
              {loading && selectedRole === 'CREATOR' ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              ) : (
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors">
                  <User className="h-8 w-8" />
                </span>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">
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
