import React from "react";
import UploadImagenECG from "./UploadImagenECG";

/**
 * 🏥 Upload Form Wrapper - Minimalista
 */
export default function UploadFormWrapper({ onUploadSuccess, isWorkspace }) {
  return (
    <UploadImagenECG
      onUploadSuccess={onUploadSuccess}
      isWorkspace={isWorkspace}
    />
  );
}
