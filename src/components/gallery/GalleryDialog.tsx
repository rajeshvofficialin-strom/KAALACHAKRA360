import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface GalleryDialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function GalleryDialog({ title, onClose, children, wide }: GalleryDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-amber-700/40 bg-gradient-to-b from-[#1e150e] to-[#0e0a07] shadow-2xl sm:rounded-2xl ${
          wide ? 'sm:max-w-4xl' : 'sm:max-w-2xl'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-amber-900/40 bg-[#1a120c]/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-base font-semibold text-amber-100 sm:text-lg">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-amber-200/70 hover:bg-amber-900/30 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
