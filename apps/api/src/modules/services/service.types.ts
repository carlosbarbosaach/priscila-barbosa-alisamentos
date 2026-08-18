import type {
  Timestamp,
} from "firebase-admin/firestore";

export type ServicePhaseDocument = {
  id: string;

  name: string;

  durationMinutes: number;

  occupiesProfessional: boolean;

  order: number;
};

export type ServiceDocument = {
  salonId: string;

  name: string;
  description: string | null;
  category: string;

  durationMinutes: number;
  defaultPriceCents: number;

  /*
   * Opcional por enquanto para manter
   * compatibilidade com serviços que
   * já existem no Firestore.
   *
   * Documentos antigos não possuem
   * esse campo ainda.
   */
  phases?: ServicePhaseDocument[];

  active: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ServiceEntity =
  ServiceDocument & {
    id: string;
  };