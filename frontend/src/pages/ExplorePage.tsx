import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Loader2, Plus, X, Image as ImageIcon, Edit2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Category {
    id: number;
    name: string;
    imageUrl: string;
}

const ExplorePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editItemName, setEditItemName] = useState('');
    const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);

    const isAdmin = user?.role?.name === 'ADMIN';

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            showToast('Lỗi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) {
            showToast('Tên item không được để trống', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = '';

            // Upload image if selected
            if (selectedImage) {
                const formData = new FormData();
                formData.append('file', selectedImage);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.url;
            }

            // Create category
            await api.post('/categories', {
                name: newItemName,
                imageUrl: uploadedImageUrl
            });

            showToast('Thêm mục mới thành công!', 'success');
            setIsAddModalOpen(false);
            setNewItemName('');
            setSelectedImage(null);
            fetchCategories(); // Refresh list
        } catch (error: any) {
            console.error('Failed to add category:', error);
            showToast(error.response?.data || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e: React.MouseEvent, cat: Category) => {
        e.stopPropagation();
        setEditingCategory(cat);
        setEditItemName(cat.name);
        setEditSelectedImage(null);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItemName.trim() || !editingCategory) {
            showToast('Tên item không được để trống', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = editingCategory.imageUrl;

            // Upload new image if selected
            if (editSelectedImage) {
                const formData = new FormData();
                formData.append('file', editSelectedImage);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.url;
            }

            // Update category
            await api.put(`/categories/${editingCategory.id}`, {
                name: editItemName,
                imageUrl: uploadedImageUrl
            });

            showToast('Cập nhật danh mục thành công!', 'success');
            setIsEditModalOpen(false);
            setEditingCategory(null);
            fetchCategories(); // Refresh list
        } catch (error: any) {
            console.error('Failed to update category:', error);
            showToast(error.response?.data || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative space-y-8 min-h-[50vh]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Khám Phá</h1>
                    <p className="text-sm text-gray-500">Khám phá các danh mục chiến dịch</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus size={18} className="mr-1" />
                        Thêm Item
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    Chưa có hạng mục nào.
                </div>
            ) : (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col items-center group cursor-pointer w-[120px] relative">
                            {isAdmin && (
                                <button
                                    onClick={(e) => handleEditClick(e, cat)}
                                    className="absolute -top-1 -right-1 p-1.5 bg-white shadow-md rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Chỉnh sửa danh mục"
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                            <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 p-2">
                                {cat.imageUrl ? (
                                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon size={32} className="text-gray-300" />
                                )}
                            </div>
                            <span className="mt-3 text-sm font-medium text-gray-800 text-center leading-tight">
                                {cat.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Adding Item */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm Danh Mục Mới</h3>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Item</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    placeholder="Vd: Làm đẹp, Giải trí..."
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Tùy chọn)</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
                                        {selectedImage ? (
                                            <img src={URL.createObjectURL(selectedImage)} alt="preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                                        <span>Chọn ảnh</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Tạo mới'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Editing Item */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-4">Cập Nhật Danh Mục</h3>

                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Item</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                                    placeholder="Vd: Làm đẹp, Giải trí..."
                                    value={editItemName}
                                    onChange={(e) => setEditItemName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện mới (Tùy chọn)</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 overflow-hidden relative group">
                                        {editSelectedImage ? (
                                            <img src={URL.createObjectURL(editSelectedImage)} alt="preview" className="h-full w-full object-cover" />
                                        ) : editingCategory?.imageUrl ? (
                                            <img src={editingCategory.imageUrl} alt="current" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex flex-col items-center">
                                        <span>Đổi ảnh</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setEditSelectedImage(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Lưu Thay Đổi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExplorePage;
