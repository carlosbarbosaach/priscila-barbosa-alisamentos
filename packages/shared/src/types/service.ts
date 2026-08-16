export type Service = {
  id: string;
  salonId: string;

  name: string;
  description: string | null;
  category: string;

  durationMinutes: number;
  defaultPriceCents: number;

  active: boolean;

  createdAt: string;
  updatedAt: string;
};