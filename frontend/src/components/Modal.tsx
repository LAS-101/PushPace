"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CloseIcon } from "./icons";

interface ModalProps {
  title: string;
  /** Omit to make the modal non-dismissable (no close button, no backdrop click). */
  onClose?: () => void;
  wide?: boolean;
  children: ReactNode;
}

export function Modal({ title, onClose, wide, children }: ModalProps) {
  // Mount first, then flip to `active` so the CSS transition runs.
  const [active, setActive] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`modal-overlay${active ? " active" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`modal${wide ? " modal-gym" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h3>{title}</h3>
          {onClose && (
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
