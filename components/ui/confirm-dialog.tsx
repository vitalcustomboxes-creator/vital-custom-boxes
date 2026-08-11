"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm and send", pending = false }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={pending ? () => undefined : onClose} title={title}>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={pending} className="w-full sm:w-auto">Cancel</Button>
        <Button size="sm" onClick={onConfirm} loading={pending} className="w-full sm:w-auto">{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
