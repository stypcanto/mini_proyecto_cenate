// ========================================================================
// 👤 AvatarCard.jsx – Avatar institucional reutilizable (CENATE 2025)
// ========================================================================

import React from "react";

export default function AvatarCard({
  name = "Usuario",
  subtitle = "",
  photoUrl = "",
  size = 96, // px
}) {
  const initial =
    (name && name.trim().charAt(0).toUpperCase()) || "U";

  const box = `${size}px`;
  const font = `${Math.max(18, Math.floor(size / 2.8))}px`;

  return (
    <div className="flex items-center gap-4">
      <div
        className="rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-info)]
                   text-white font-bold shadow-lg flex items-center justify-center overflow-hidden"
        style={{ width: box, height: box, fontSize: font }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initial
        )}
      </div>

      <div>
        <div className="text-xl font-semibold text-[var(--text-primary)]">
          {name}
        </div>
        {subtitle && (
          <div className="text-sm text-[var(--text-secondary)]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}