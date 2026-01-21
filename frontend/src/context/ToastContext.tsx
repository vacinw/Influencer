import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-md border-l-4 animate-in slide-in-from-right-full duration-300 ${
                            toast.type === 'success' ? 'border-green-500' :
                            toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
                        }`}
                    >
                        <div className="flex items-center justify-center w-12 bg-transparent">
                            {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                            {toast.type === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                            {toast.type === 'info' && <Info className="w-6 h-6 text-blue-500" />}
                        </div>
                        <div className="px-4 py-2 -mx-3">
                            <div className="mx-3">
                                <span className={`font-semibold ${
                                    toast.type === 'success' ? 'text-green-500' :
                                    toast.type === 'error' ? 'text-red-500' : 'text-blue-500'
                                }`}>
                                    {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                                </span>
                                <p className="text-sm text-gray-600">{toast.message}</p>
                            </div>
                        </div>
                        <div className="p-2 ml-auto">
                            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-gray-900">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
