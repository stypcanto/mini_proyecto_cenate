import React, { useEffect } from "react";

/**
 * =======================================================================
 * Modal Simple Reutilizable
 * =======================================================================
 */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-bold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-auto max-h-[calc(92vh-68px)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
