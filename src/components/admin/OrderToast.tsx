import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderToastProps {
    msg: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const OrderToast = ({ msg, type, onClose }: OrderToastProps) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-bounce-in
          ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
    );
};
