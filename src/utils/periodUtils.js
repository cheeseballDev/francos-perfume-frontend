import { todayInManila } from "@/utils/formattingUtils";

export const PERIODS = Object.freeze({
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR",
    CUSTOM: "CUSTOM",
});

export const PERIOD_OPTIONS = [
    { value: PERIODS.WEEK, label: "Last Week", shortLabel: "last 7 days" },
    { value: PERIODS.MONTH, label: "Last Month", shortLabel: "last 30 days" },
    { value: PERIODS.YEAR, label: "Last Year", shortLabel: "last 12 months" },
    { value: PERIODS.CUSTOM, label: "Custom Range", shortLabel: "selected dates" },
];

const CUSTOM_PREFIX = `${PERIODS.CUSTOM}:`;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isCustomPeriod = (period) =>
    typeof period === "string" && period.startsWith(CUSTOM_PREFIX);

export const toCustomPeriod = (fromDate, toDate) => `${CUSTOM_PREFIX}${fromDate}:${toDate}`;

const parseCustomPeriod = (period) => {
    const [, fromDate, toDate] = period.split(":");
    if (!DATE_PATTERN.test(fromDate ?? "") || !DATE_PATTERN.test(toDate ?? "")) return null;
    return fromDate <= toDate ? { fromDate, toDate } : { fromDate: toDate, toDate: fromDate };
};

export const getSelectValue = (period) => (isCustomPeriod(period) ? PERIODS.CUSTOM : period);

export const DEFAULT_PERIOD = PERIODS.MONTH;

const shiftDays = (yyyyMMdd, days) => {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
};

const shiftYears = (yyyyMMdd, years) => {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    const date = new Date(Date.UTC(year + years, month - 1, day + 1));
    return date.toISOString().slice(0, 10);
};

export const getPeriodRange = (period = DEFAULT_PERIOD) => {
    if (isCustomPeriod(period)) {
        const custom = parseCustomPeriod(period);
        if (custom) return custom;
    }
    const toDate = todayInManila();
    switch (period) {
        case PERIODS.WEEK:
            return { fromDate: shiftDays(toDate, -6), toDate };
        case PERIODS.YEAR:
            return { fromDate: shiftYears(toDate, -1), toDate };
        case PERIODS.MONTH:
        default:
            return { fromDate: shiftDays(toDate, -29), toDate };
    }
};

export const getPeriodOption = (period) =>
    PERIOD_OPTIONS.find((option) => option.value === getSelectValue(period)) ?? PERIOD_OPTIONS[1];

const rangeFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatPeriodRange = (period) => {
    const { fromDate, toDate } = getPeriodRange(period);
    const toLabel = (yyyyMMdd) => rangeFormatter.format(new Date(`${yyyyMMdd}T00:00:00Z`));
    return `${toLabel(fromDate)} – ${toLabel(toDate)}`;
};

export const getPeriodLabel = (period) =>
    isCustomPeriod(period) ? formatPeriodRange(period) : getPeriodOption(period).label;

export const describePeriod = (period) =>
    isCustomPeriod(period) ? formatPeriodRange(period) : `the ${getPeriodOption(period).shortLabel}`;
