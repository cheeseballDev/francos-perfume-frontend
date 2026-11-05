import { TONES } from "@/utils/statusUtils";

export const REASON_OPTIONS = [
    { value: "CHANGE OF MIND", label: "Change of mind" },
    { value: "HIDDEN DEFECT", label: "Hidden defect" },
];

export const RETURNED_ITEM_OPTIONS = [
    { value: "RETURN TO STOCK", label: "Return to inventory" },
    { value: "DISCARD", label: "Broken, discard it" },
];

const RETURNED_ITEM_TONES = {
    "RETURN TO STOCK": TONES.success,
    DISCARD: TONES.danger,
};

export const returnedItemForReason = (reason) => {
    if (reason === "HIDDEN DEFECT") return "DISCARD";
    if (reason === "CHANGE OF MIND") return "RETURN TO STOCK";
    return "";
};

export const reasonLabel = (value) =>
    REASON_OPTIONS.find((option) => option.value === value)?.label ?? value ?? "N/A";

export const returnedItemLabel = (value) =>
    RETURNED_ITEM_OPTIONS.find((option) => option.value === value)?.label ?? value ?? "N/A";

export const returnedItemClass = (value) => RETURNED_ITEM_TONES[value] ?? TONES.neutral;

export const tierRank = (tier) => (String(tier ?? "").toUpperCase() === "PREMIUM" ? 2 : 1);

export const SHOP_POLICY = [
    "The perfume is inspected in front of the customer: spray test, cracks and other defects.",
    "Returns are accepted on the day of purchase only.",
    "Accepted reasons: change of mind (the perfume goes back to inventory) or a hidden defect (the perfume is discarded), both subject to inspection.",
    "Exchange for another scent only. Strictly no refunds.",
    "Classic is exchanged for any Classic, male or female. The customer pays the difference to move up to a Premium scent.",
];
