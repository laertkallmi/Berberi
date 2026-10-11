import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { Lock, X, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdmin } = useCalendar();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      setError('');
      setPin('');
      onSuccess();
    } else {
      setError('PIN i pasaktë. Ju lutem provoni përsëri.');
    }
  };

  const handleKeyClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#11131a] border border-[#232733] rounded-2xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-cinzel font-semibold text-white">
            Paneli Administrativ
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Vendosni kodin PIN për të hyrë në menaxhimin e orareve dhe takimeve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input Display */}
          <div className="flex justify-center gap-3 my-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-11 h-12 rounded-xl border flex items-center justify-center text-lg font-mono font-bold transition-all ${
                  pin.length > index
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                    : 'border-[#262c3b] bg-[#161922] text-slate-500'
                }`}
              >
                {pin.length > index ? '•' : ''}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyClick(digit)}
                className="py-3 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#232733] text-base font-semibold text-white active:scale-95 transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="py-3 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#232733] text-xs font-medium text-slate-400 active:scale-95 transition-all cursor-pointer"
            >
              Pastro
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="py-3 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#232733] text-base font-semibold text-white active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#232733] text-xs font-medium text-slate-400 active:scale-95 transition-all cursor-pointer"
            >
              Fshi
            </button>
          </div>

          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full mt-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            Hyr në Panel
          </button>
        </form>
      </div>
    </div>
  );
};
