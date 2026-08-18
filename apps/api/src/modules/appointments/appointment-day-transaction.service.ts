import {
    Timestamp,
    type Transaction,
} from "firebase-admin/firestore";

import {
    firestore,
} from "../../shared/firebase/firebase-firestore.js";

const COLLECTION_NAME =
    "appointmentDayLocks";

type AppointmentDayLockDocument = {
    /*
     * Multi-tenant.
     */
    salonId: string;

    /*
     * Data local do salão:
     *
     * YYYY-MM-DD
     */
    dateKey: string;

    /*
     * Contador utilizado para que
     * cada operação modifique o lock.
     *
     * Não representa quantidade
     * de agendamentos.
     */
    revision: number;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

type RunAppointmentDayTransactionInput = {
    salonId: string;
    dateKey: string;
};

export type AppointmentDayTransactionWork<T> = (
    transaction: Transaction,
) => Promise<T>;

export class AppointmentDayTransactionService {
    async run<T>(
        input: RunAppointmentDayTransactionInput,

        work:
            AppointmentDayTransactionWork<T>,
    ): Promise<T> {
        const {
            salonId,
            dateKey,
        } = input;

        this.validateSalonId(
            salonId,
        );

        this.validateDateKey(
            dateKey,
        );

        /*
         * Um único documento para:
         *
         * salão + dia.
         *
         * Exemplo:
         *
         * priscila-barbosa-alisamentos
         * +
         * 2026-08-20
         *
         * ↓
         *
         * priscila-barbosa-alisamentos__2026-08-20
         */
        const lockId =
            this.buildLockId(
                salonId,
                dateKey,
            );

        const lockReference =
            firestore
                .collection(
                    COLLECTION_NAME,
                )
                .doc(
                    lockId,
                );

        return firestore.runTransaction(
            async (
                transaction,
            ) => {
                /*
                 * IMPORTANTE:
                 *
                 * O lock é sempre a primeira
                 * leitura da transação.
                 *
                 * No próximo passo, depois dele,
                 * vamos ler os appointments
                 * daquele dia.
                 */
                const lockSnapshot =
                    await transaction.get(
                        lockReference,
                    );

                let currentRevision =
                    0;

                let createdAt =
                    Timestamp.now();

                if (
                    lockSnapshot.exists
                ) {
                    const lock =
                        lockSnapshot.data() as
                        AppointmentDayLockDocument;

                    /*
                     * Proteção para nunca reutilizar
                     * acidentalmente um lock de
                     * outro salão ou data.
                     */
                    if (
                        lock.salonId !==
                        salonId ||
                        lock.dateKey !==
                        dateKey
                    ) {
                        throw new Error(
                            "Lock de agenda inconsistente.",
                        );
                    }

                    if (
                        !Number.isInteger(
                            lock.revision,
                        ) ||
                        lock.revision < 0
                    ) {
                        throw new Error(
                            "Lock de agenda possui revisão inválida.",
                        );
                    }

                    currentRevision =
                        lock.revision;

                    createdAt =
                        lock.createdAt;
                }

                /*
                 * Aqui será executado o trabalho
                 * protegido pela transação.
                 *
                 * No 141F.3:
                 *
                 * 1. ler appointments do dia
                 * 2. verificar ConflictService
                 * 3. criar appointment
                 *
                 * Tudo dentro desta mesma
                 * transaction.
                 */
                const result =
                    await work(
                        transaction,
                    );

                const now =
                    Timestamp.now();

                /*
                 * Sempre alteramos o lock.
                 *
                 * Se outra transação tiver
                 * modificado o mesmo documento,
                 * o Firestore tratará a
                 * concorrência.
                 */
                transaction.set(
                    lockReference,
                    {
                        salonId,
                        dateKey,

                        revision:
                            currentRevision +
                            1,

                        createdAt,
                        updatedAt:
                            now,
                    } satisfies
                    AppointmentDayLockDocument,
                );

                return result;
            },
        );
    }

    private buildLockId(
        salonId: string,
        dateKey: string,
    ): string {
        /*
         * encodeURIComponent evita que
         * caracteres especiais do salonId
         * sejam interpretados como caminho
         * do Firestore.
         */
        return `${encodeURIComponent(
            salonId,
        )}__${dateKey}`;
    }

    private validateSalonId(
        salonId: string,
    ): void {
        if (
            !salonId ||
            salonId.trim().length ===
            0
        ) {
            throw new Error(
                "Salão não informado.",
            );
        }
    }

    private validateDateKey(
        dateKey: string,
    ): void {
        const match =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                dateKey,
            );

        if (!match) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }

        const year =
            Number(
                match[1],
            );

        const month =
            Number(
                match[2],
            );

        const day =
            Number(
                match[3],
            );

        const date =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                    12,
                ),
            );

        const valid =
            date.getUTCFullYear() ===
            year &&
            date.getUTCMonth() ===
            month - 1 &&
            date.getUTCDate() ===
            day;

        if (!valid) {
            throw new Error(
                "Data inválida.",
            );
        }
    }
}