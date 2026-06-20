import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PrayerRequestForm } from "@/components/prayer/prayer-request-form";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Submit Prayer Request",
  description: `Submit a prayer request for review on ${siteConfig.name}.`,
};

export default function SubmitPrayerRequestPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-10 pt-2">
      <Link
        href="/prayer-requests"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Prayer Requests
      </Link>

      <PrayerRequestForm />
    </div>
  );
}
