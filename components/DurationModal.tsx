
import React, { useState } from 'react';

interface DurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
}

const DurationModal: React.FC<DurationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [hh, setHh] = useState('00');
  const [mm, setMm] = useState('05');
  const [ss, setSs] = useState('00');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const hours = parseInt(hh) || 0;
    const minutes = parseInt(mm) || 0;
    const seconds = parseInt(ss) || 0;
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

    if (totalSeconds <= 0) {
      alert("Please enter a valid duration greater than 0.");
      return;
    }
    onConfirm(totalSeconds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm p-8 border border-neutral-200 shadow-2xl">
        <h2 className="text-xl font-medium mb-6 uppercase tracking-wider text-neutral-600">
          Set Custom Duration
        </h2>
        
        <div className="flex gap-4 items-center justify-center mb-8">
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">HH</label>
            <input
              type="text"
              maxLength={2}
              value={hh}
              onChange={(e) => setHh(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="w-16 bg-neutral-50 border border-neutral-200 p-3 text-center mono text-lg outline-none focus:border-neutral-400"
              placeholder="00"
            />
          </div>
          <span className="text-xl font-light text-neutral-300 mt-6">:</span>
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">MM</label>
            <input
              type="text"
              maxLength={2}
              value={mm}
              onChange={(e) => setMm(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="w-16 bg-neutral-50 border border-neutral-200 p-3 text-center mono text-lg outline-none focus:border-neutral-400"
              placeholder="00"
            />
          </div>
          <span className="text-xl font-light text-neutral-300 mt-6">:</span>
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">SS</label>
            <input
              type="text"
              maxLength={2}
              value={ss}
              onChange={(e) => setSs(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="w-16 bg-neutral-50 border border-neutral-200 p-3 text-center mono text-lg outline-none focus:border-neutral-400"
              placeholder="00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-neutral-900 text-white text-xs font-medium uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DurationModal;
