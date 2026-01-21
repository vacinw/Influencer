import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
    id: number;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

const Wallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const response = await api.get('/wallet/summary');
            setBalance(response.data.balance);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Failed to fetch wallet info", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/wallet/deposit', { amount: parseFloat(depositAmount) });
            setDepositAmount('');
            // Refresh data
            fetchWalletData();
            alert('Deposit successful!');
        } catch (error) {
            console.error("Deposit failed", error);
            alert('Deposit failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center">
                <div>
                    <p className="text-gray-400 font-medium mb-1">Total Balance</p>
                    <h2 className="text-4xl font-bold flex items-center">
                        <DollarSign className="w-8 h-8 mr-1 opacity-70" />
                        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className="mt-6 md:mt-0">
                    <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-3">
                         <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-900 h-10"
                              placeholder="0.00"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              min="1"
                              step="0.01"
                              required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Deposit Funds
                        </button>
                    </form>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
                </div>
                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No transactions yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {tx.type === 'DEPOSIT' ? (
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <ArrowDownLeft size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                        <ArrowUpRight size={16} />
                                                    </div>
                                                )}
                                                <span className="ml-3 text-sm font-medium text-gray-900">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                                tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-1.5 text-gray-400"/>
                                                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
