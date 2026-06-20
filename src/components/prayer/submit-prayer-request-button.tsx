"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useContentAuthDialog } from "@/context/content-auth-dialog-context";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PrayerRequestForm } from "./prayer-request-form";

type SubmitPrayerRequestButtonProps = {
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
};

export function SubmitPrayerRequestButton({
  className,
  size = "default",
  variant = "default",
}: SubmitPrayerRequestButtonProps) {
  const { authUser, loading } = useFirebaseAuth();
  const { openDialog } = useContentAuthDialog();
  const [open, setOpen] = useState(false);

  function handleClick() {
    if (loading) return;

    if (!authUser) {
      openDialog("/prayer-requests", { redirectOnClose: false });
      return;
    }

    setOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={handleClick}
        disabled={loading}
      >
        <Plus className="mr-2 size-4" />
        Submit Prayer Request
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Prayer Request</DialogTitle>
            <DialogDescription>
              Share your prayer need with the community. Requests are reviewed
              before appearing publicly.
            </DialogDescription>
          </DialogHeader>

          {open ?
            <PrayerRequestForm variant="dialog" />
          : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
