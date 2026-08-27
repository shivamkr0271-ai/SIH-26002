import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-100 dark:bg-black/40">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
