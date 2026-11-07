import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 modal-overlay cursor-default"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#181c24] border border-gray-700/60 p-5 shadow-2xl text-gray-200 cursor-default modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="text-[13px] font-bold text-center text-gray-100 mb-3 tracking-wide">
            {title}
          </h3>
        )}
        <div className="text-[12px] text-gray-300 text-center leading-relaxed">
          {children}
        </div>
        {actions && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

