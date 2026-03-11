import { useState, useEffect, useMemo } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Loader2,
    Plus,
    Minus,
    TrendingUp,
    TrendingDown,
    Search,
    CreditCard
} from 'lucide-react';
import api from '../services/api';

interface Transaction {
    id: number;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

const WalletPage = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
    const [depositAmount, setDepositAmount] = useState('10000');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
    const [initialBalance, setInitialBalance] = useState<number | null>(null);

    useEffect(() => {
        fetchWalletData();
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        if (!showDepositModal) return;

        // Reset timer and balance snapshot when modal opens
        setTimeLeft(900);
        setInitialBalance(balance);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowDepositModal(false);
                    alert("Thời gian nạp tiền đã hết. Vui lòng tạo yêu cầu mới.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showDepositModal]);

    // Polling Logic for Auto-close
    useEffect(() => {
        if (!showDepositModal || initialBalance === null) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await api.get('/wallet/summary');
                const newBalance = response.data.balance;

                if (newBalance > initialBalance) {
                    // Diopsit detected
                    setBalance(newBalance);
                    setTransactions(response.data.transactions);
                    setShowDepositModal(false);
                    alert("Nạp tiền thành công! Số dư đã được cập nhật.");
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error("Polling wallet data failed", error);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(pollInterval);
    }, [showDepositModal, initialBalance]);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/wallet/summary');
            setBalance(response.data.balance);
            setTransactions(response.data.transactions);
            setUserId(response.data.userId);
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Statistics
    const stats = useMemo(() => {
        return transactions.reduce((acc, curr) => {
            const isDeposit = curr.type === 'DEPOSIT' || curr.type === 'PAYMENT_RECEIVED';
            if (isDeposit) {
                acc.income += curr.amount;
            } else {
                acc.expense += curr.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactions]);

    // Filter Transactions
    const filteredTransactions = useMemo(() => {
        if (filter === 'ALL') return transactions;
        return transactions.filter(tx => {
            const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED';
            return filter === 'IN' ? isDeposit : !isDeposit;
        });
    }, [transactions, filter]);

    const handleWithdraw = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        setProcessing(true);
        try {
            await api.post('/wallet/withdraw', { amount: Number(amount) });
            setAmount('');
            setShowWithdrawModal(false);
            fetchWalletData();
            alert("Đã gửi yêu cầu rút tiền thành công!");
        } catch (error: any) {
            alert(error.response?.data || "Yêu cầu rút tiền thất bại");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Wallet className="text-indigo-600" /> Tổng Quan Tài Chính
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý thu nhập, chi tiêu và rút tiền của bạn.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-all shadow-sm"
                        >
                            <Minus className="w-4 h-4 mr-2" /> Rút Tiền
                        </button>
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-md shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nạp Tiền
                        </button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Balance */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden col-span-1 md:col-span-1">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-sm font-medium mb-1">Số Dư Tổng</p>
                            <h2 className="text-4xl font-bold tracking-tight">
                                {balance.toLocaleString()} ₫
                            </h2>
                            <div className="mt-6 flex items-center gap-2 text-indigo-100 text-xs">
                                <CreditCard size={14} />
                                <span>Ví ID: ****{userId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">Tổng Thu Nhập</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 ml-1">
                            +{stats.income.toLocaleString()} ₫
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <TrendingDown size={20} />
                            </div>
                            <span className="text-gray-500 text-sm font-medium">Tổng Chi Tiêu</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 ml-1">
                            -{stats.expense.toLocaleString()} ₫
                        </p>
                    </div>
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900">Lịch Sử Giao Dịch</h3>

                        <div className="flex p-1 bg-gray-100 rounded-lg">
                            {(['ALL', 'IN', 'OUT'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'ALL' ? 'Tất cả' : tab === 'IN' ? 'Thu' : 'Chi'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <h4 className="text-gray-900 font-medium mb-1">Không tìm thấy giao dịch</h4>
                            <p className="text-gray-500 text-sm">Bạn chưa có giao dịch nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredTransactions.map((tx) => {
                                const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED';
                                return (
                                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-medium">{tx.description}</p>
                                                <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                                                    <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {tx.status === 'COMPLETED' ? 'HOÀN THÀNH' : tx.status === 'PENDING' ? 'CHỜ XỬ LÝ' : tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isDeposit ? 'text-green-600' : 'text-gray-900'}`}>
                                                {isDeposit ? '+' : '-'}{tx.amount.toLocaleString()} ₫
                                            </p>
                                            <p className="text-xs text-gray-400 uppercase">
                                                {tx.type === 'DEPOSIT' ? 'NẠP TIỀN' :
                                                    tx.type === 'PAYMENT_RECEIVED' ? 'NHẬN THANH TOÁN' :
                                                        tx.type === 'WITHDRAWAL' ? 'RÚT TIỀN' :
                                                            tx.type === 'PAYMENT_SENT' ? 'GỬI THANH TOÁN' :
                                                                tx.type.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-6">
                                <Wallet className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nạp Tiền Vào Ví</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Nhập số tiền và quét mã QR để nạp tiền ngay lập tức.
                            </p>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-left">Số Tiền Nạp</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        className="block w-full pl-8 pr-12 py-3 text-xl font-bold text-gray-900 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                                        placeholder="10,000"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">VND</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Quét bằng Ứng dụng Ngân hàng</p>

                                {/* QR Code */}
                                <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                                    <img
                                        src={`https://qr.sepay.vn/img?acc=${import.meta.env.VITE_SEPAY_ACCOUNT_NO || ''}&bank=${import.meta.env.VITE_SEPAY_BANK_NAME || ''}&amount=${depositAmount || 0}&des=ICS${String(userId).padStart(6, '0')}`}
                                        alt="QR Code"
                                        className="w-40 h-40 object-contain mx-auto"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Thông tin Chuyển khoản Thủ công</p>
                                        <span className={`text-xs font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                                            Thời gian: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000 ease-linear"
                                            style={{ width: `${(timeLeft / 900) * 100}%` }}
                                        />
                                        <p className="text-xs text-indigo-600 font-medium mb-1 text-center">Nội dung Chuyển khoản</p>
                                        <div className="flex items-center justify-center">
                                            <span className="text-2xl font-mono font-black text-indigo-700 tracking-wider">ICS{String(userId).padStart(6, '0')}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-red-500 mt-2 font-medium">
                                        ⚠️ Nội dung PHẢI chính xác như hiển thị để được nạp tiền tự động
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <button
                                        onClick={fetchWalletData}
                                        className="w-full flex justify-center items-center px-4 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Kiểm Tra Trạng Thái Nạp Tiền
                                    </button>

                                    <button
                                        onClick={() => setShowDepositModal(false)}
                                        className="w-full px-4 py-3 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rút Tiền Khỏi Ví</h3>
                        <p className="text-sm text-gray-500 mb-6">Nhập số tiền bạn muốn rút về tài khoản ngân hàng đã liên kết.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số Tiền</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₫</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="block w-full pl-7 pr-12 py-3 sm:text-sm border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 border"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">VND</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-md shadow-indigo-200 transition-colors"
                                >
                                    {processing ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
