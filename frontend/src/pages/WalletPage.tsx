import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Loader2, Plus, Minus } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/wallet/summary');
            setBalance(response.data.balance);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        setProcessing(true);
        try {
            await api.post('/wallet/deposit', { amount: Number(amount) });
            setAmount('');
            setShowDepositModal(false);
            fetchWalletData();
            alert("Deposit successful!");
        } catch (error) {
            alert("Deposit failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        setProcessing(true);
        try {
            await api.post('/wallet/withdraw', { amount: Number(amount) });
            setAmount('');
            setShowWithdrawModal(false);
            fetchWalletData();
            alert("Withdrawal request submitted!");
        } catch (error: any) {
            alert(error.response?.data || "Withdrawal failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>

            {loading ? (
                 <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <>
                    {/* Balance Card */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Balance</p>
                                <h2 className="text-5xl font-bold mt-2 flex items-baseline">
                                    <span className="text-2xl mr-1">$</span>
                                    {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowDepositModal(true)}
                                    className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Top Up
                                </button>
                                <button 
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 backdrop-blur-sm"
                                >
                                    <Minus className="mr-2 h-5 w-5" />
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
                            <span className="text-sm text-gray-500">Recent Activity</span>
                        </div>
                        
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`p-2 rounded-full mr-3 ${
                                                            tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED' ? 'bg-green-100 text-green-600' : 
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                            {tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED' ? 
                                                                <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />
                                                            }
                                                        </div>
                                                        <span className="font-medium text-gray-900 capitalize">{tx.type.replace('_', ' ').toLowerCase()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                                    {tx.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                                                     tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {tx.type === 'DEPOSIT' || tx.type === 'PAYMENT_RECEIVED' ? '+' : '-'}${tx.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Top Up Wallet</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter amount to deposit (Mock Payment)</p>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter amount (e.g. 1000)"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDepositModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeposit}
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Confirm Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Withdraw Funds</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter amount to withdraw</p>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter amount"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowWithdrawModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Request Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
