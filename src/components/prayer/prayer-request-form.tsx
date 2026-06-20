"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { useActiveChurchScope } from "@/context/active-church-context";
import { createPrayerRequest } from "@/lib/prayer-request-mutations";
import {
  PRAYER_REQUEST_MAX,
  PRAYER_TITLE_MAX,
  prayerRequestSubmitSchema,
  type PrayerRequestSubmitValues,
} from "@/lib/prayer-request-validation";

const SUCCESS_MESSAGE =
  "Thank you for sharing your prayer request. It has been submitted for review and will appear once approved.";

function getDefaultName(
  profile: { firstName?: string; lastName?: string } | null,
  authUser: { displayName?: string | null } | null
): string {
  if (profile?.firstName || profile?.lastName) {
    return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
  }

  return authUser?.displayName?.trim() ?? "";
}

type PrayerRequestFormProps = {
  variant?: "page" | "dialog";
};

export function PrayerRequestForm({
  variant = "page",
}: PrayerRequestFormProps) {
  const router = useRouter();
  const { authUser, profile, loading } = useFirebaseAuth();
  const { churchId, isLoading: churchLoading } = useActiveChurchScope();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PrayerRequestSubmitValues>({
    resolver: zodResolver(prayerRequestSubmitSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      request: "",
      isAnonymous: false,
    },
  });

  const isAnonymous = form.watch("isAnonymous");

  useEffect(() => {
    if (loading || !authUser) return;

    const defaultName = getDefaultName(profile, authUser);
    if (defaultName && !form.getValues("name")) {
      form.setValue("name", defaultName, { shouldDirty: false });
    }
  }, [authUser, profile, loading, form]);

  async function onSubmit(values: PrayerRequestSubmitValues) {
    if (!authUser) {
      setSubmitError("Please sign in to submit a prayer request.");
      return;
    }

    if (!churchId) {
      setSubmitError("No church is configured yet. Please try again later.");
      return;
    }

    setSubmitError(null);

    try {
      const resolvedName = values.isAnonymous
        ? ""
        : values.name.trim() || getDefaultName(profile, authUser);

      await createPrayerRequest(churchId, {
        ...values,
        name: resolvedName,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Unable to submit your prayer request. Please try again.");
    }
  }

  if (loading || churchLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to submit a prayer request.
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/signin?callbackUrl=/prayer-requests">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    const successContent = (
      <div className="space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
          Submitted
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {SUCCESS_MESSAGE}
        </p>
        {variant === "page" ?
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="default" className="rounded-full">
              <Link href="/prayer-requests">View Prayer Requests</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => router.push("/")}
            >
              Back Home
            </Button>
          </div>
        : null}
      </div>
    );

    if (variant === "dialog") {
      return successContent;
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
        <div className="space-y-4 p-6 sm:p-8">{successContent}</div>
      </div>
    );
  }

  const formBody = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prayer Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief title for your request"
                  maxLength={PRAYER_TITLE_MAX}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="request"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prayer Request</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your prayer need..."
                  rows={6}
                  maxLength={PRAYER_REQUEST_MAX}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="space-y-1">
                <FormLabel>Submit anonymously</FormLabel>
                <FormDescription>
                  Your name will not be shown publicly if approved.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isAnonymous ?
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  Pre-filled from your profile when available.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        : null}

        {submitError ?
          <p className="text-sm text-destructive">{submitError}</p>
        : null}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-full sm:w-auto"
        >
          {form.formState.isSubmitting ?
            <Loader2 className="mr-2 size-4 animate-spin" />
          : <Send className="mr-2 size-4" />}
          Submit Prayer Request
        </Button>
      </form>
    </Form>
  );

  if (variant === "dialog") {
    return formBody;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
      <div className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
            Share a Need
          </p>
          <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Submit Prayer Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Share your prayer need with our community. Requests are reviewed
            before appearing publicly.
          </p>
        </div>

        {formBody}
      </div>
    </div>
  );
}
