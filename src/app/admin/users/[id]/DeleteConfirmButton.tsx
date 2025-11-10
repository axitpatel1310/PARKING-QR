"use client";
import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmText?: string;
};

export default function DeleteConfirmButton({
  confirmText = "Delete this user and all related sessions/invoices?",
  onClick,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        // block submit unless confirmed
        if (!confirm(confirmText)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
