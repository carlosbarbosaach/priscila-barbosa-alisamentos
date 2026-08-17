export function normalizeBrazilPhone(
    phone: string,
): string {
    const digits = phone.replace(/\D/g, "");

    let nationalNumber = digits;

    // Remove o código do Brasil somente quando ele
    // realmente estiver presente como código do país.
    if (
        digits.startsWith("55") &&
        (digits.length === 12 ||
            digits.length === 13)
    ) {
        nationalNumber = digits.slice(2);
    }

    if (
        nationalNumber.length !== 10 &&
        nationalNumber.length !== 11
    ) {
        throw new Error(
            "Informe um telefone brasileiro válido com DDD.",
        );
    }

    const ddd = Number(
        nationalNumber.slice(0, 2),
    );

    if (ddd < 11 || ddd > 99) {
        throw new Error(
            "Informe um DDD válido.",
        );
    }

    return `55${nationalNumber}`;
}