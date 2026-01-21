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
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto"
      >
        <div className="w-full max-w-7xl my-8 overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
            <div className="font-bold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
