import { SalonService } from "../modules/salons/salon.service.js";

const salonService = new SalonService();

const SALON_ID =
    "priscila-barbosa-alisamentos";

try {
    const existingSalon =
        await salonService.findById(SALON_ID);

    if (existingSalon) {
        console.log(
            "ℹ️ O salão já existe no Firestore.",
        );

        console.log("ID:", existingSalon.id);
        console.log("Nome:", existingSalon.name);

        process.exit(0);
    }

    const salon = await salonService.create({
        id: SALON_ID,
        name: "PRISCILA BARBOSA ALISAMENTOS",
        slug: "priscila-barbosa-alisamentos",
        timezone: "America/Sao_Paulo",
    });

    console.log(
        "✅ Salão criado com sucesso.",
    );

    console.log("ID:", salon.id);
    console.log("Nome:", salon.name);
} catch (error) {
    console.error(
        "❌ Não foi possível criar o salão.",
    );

    console.error(error);

    process.exit(1);
}