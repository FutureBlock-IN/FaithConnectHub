export type FirebaseChurch = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  pastorName?: string;
  establishedYear?: number;
  /** Theme tokens — future-ready branding */
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CreateChurchInput = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  pastorName?: string;
  establishedYear?: number;
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  isActive?: boolean;
};

export type UpdateChurchInput = Partial<CreateChurchInput>;

export type ChurchRole = "member" | "admin";

export type ChurchMembership = {
  churchId: string;
  role: ChurchRole;
};
