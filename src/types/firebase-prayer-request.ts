export type PrayerRequestStatus = "pending" | "approved" | "rejected";

export type FirebasePrayerRequest = {
  id: string;
  churchId: string;
  userId?: string;
  name: string;
  email?: string;
  title: string;
  request: string;
  isAnonymous: boolean;
  status: PrayerRequestStatus;
  prayerCount: number;
  createdAt: number;
  updatedAt: number;
};

export type CreatePrayerRequestInput = {
  churchId: string;
  userId: string;
  name: string;
  email?: string;
  title: string;
  request: string;
  isAnonymous: boolean;
};

export type UpdatePrayerRequestInput = {
  status?: PrayerRequestStatus;
  prayerCount?: number;
};
