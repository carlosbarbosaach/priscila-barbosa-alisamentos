import {
    APPOINTMENT_PRICE_SOURCE,
    type AppointmentPriceSource,
} from "@priscila/shared";

import {
    Flame,
} from "lucide-react";

type AppointmentPromotionBadgeProps = {
    priceSource:
    AppointmentPriceSource;

    className?:
    string;
};

export function AppointmentPromotionBadge({
    priceSource,
    className = "",
}: AppointmentPromotionBadgeProps) {
    if (
        priceSource !==
        APPOINTMENT_PRICE_SOURCE
            .PROMOTION
    ) {
        return null;
    }

    return (
        <span
            className={[
                "inline-flex w-fit items-center gap-1 rounded-full border border-[#E9D39E] bg-[#FFF7DF] px-2.5 py-1 text-[11px] font-semibold text-[#755819]",
                className,
            ].join(
                " ",
            )}
        >
            <Flame className="size-3" />

            Promoção
        </span>
    );
}