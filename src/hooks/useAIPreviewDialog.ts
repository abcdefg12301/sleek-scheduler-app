
import { useState } from "react";

/**
 * Provides state management for the AI Preview Dialog.
 */
export function useAIPreviewDialog(initial: boolean = false) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(initial);
  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  return { isPreviewOpen, openPreview, closePreview, setIsPreviewOpen };
}
