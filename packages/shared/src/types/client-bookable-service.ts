import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

export type ClientBookableService = {
  id: string;

  name: string;

  description: string | null;

  category: string;

  durationMinutes: number;

  defaultPriceCents: number;

  priceCents: number;

  priceSource:
    AppointmentPriceSource;
};