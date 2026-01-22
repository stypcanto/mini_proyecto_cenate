import React, { useEffect } from "react";

/**
 * =======================================================================
 * Modal Simple Reutilizable
 * =======================================================================
 */
export default function Modal({ open, onClose, title, children }) {
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Scroll al inicio cuando se abre el modal
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white">
            <div className="font-bold">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold transition-all"
            >
              Cerrar
            </button>
          </div>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
