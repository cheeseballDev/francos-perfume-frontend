import { todayInManila } from "@/utils/formattingUtils";

export const PERIODS = Object.freeze({
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR",
});

export const PERIOD_OPTIONS = [
    { value: PERIODS.WEEK, label: "Last Week", shortLabel: "last 7 days" },
    { value: PERIODS.MONTH, label: "Last Month", shortLabel: "last 30 days" },
    { value: PERIODS.YEAR, label: "Last Year", shortLabel: "last 12 months" },
];

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
    PERIOD_OPTIONS.find((option) => option.value === period) ?? PERIOD_OPTIONS[1];

const rangeFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatPeriodRange = (period) => {
    const { fromDate, toDate } = getPeriodRange(period);
    const toLabel = (yyyyMMdd) => rangeFormatter.format(new Date(`${yyyyMMdd}T00:00:00Z`));
    return `${toLabel(fromDate)} – ${toLabel(toDate)}`;
};
