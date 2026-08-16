import { Timestamp } from "firebase-admin/firestore";

import { SalonRepository } from "./salon.repository.js";
import type { SalonEntity } from "./salon.types.js";

type CreateSalonInput = {
    id: string;
    name: string;
    slug: string;
    timezone: string;
};

export class SalonService {
    constructor(
        private readonly salonRepository =
            new SalonRepository(),
    ) { }

    async findById(
        salonId: string,
    ): Promise<SalonEntity | null> {
        return this.salonRepository.findById(salonId);
    }

    async create(
        input: CreateSalonInput,
    ): Promise<SalonEntity> {
        const existingSalon =
            await this.salonRepository.findById(input.id);

        if (existingSalon) {
            throw new Error(
                "Já existe um salão com esse ID.",
            );
        }

        const now = Timestamp.now();

        await this.salonRepository.create(
            input.id,
            {
                name: input.name,
                slug: input.slug,
                active: true,
                timezone: input.timezone,
                createdAt: now,
                updatedAt: now,
            },
        );

        const createdSalon =
            await this.salonRepository.findById(input.id);

        if (!createdSalon) {
            throw new Error(
                "Não foi possível localizar o salão após a criação.",
            );
        }

        return createdSalon;
    }
}