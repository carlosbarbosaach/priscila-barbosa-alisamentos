import { UserService } from "../modules/users/user.service.js";

const userService = new UserService();

const USER_ID =
    "Uvx8wiWYi1ex6y7xfK7VyPRL9Wu2";

try {
    const user =
        await userService.promoteToAdmin(USER_ID);

    console.log(
        "✅ Usuário promovido para ADMIN.",
    );

    console.log("ID:", user.id);
    console.log("Nome:", user.displayName);
    console.log("E-mail:", user.email);
    console.log("Perfil:", user.role);
    console.log("Salão:", user.salonId);
} catch (error) {
    console.error(
        "❌ Não foi possível promover o usuário.",
    );

    console.error(error);

    process.exit(1);
}