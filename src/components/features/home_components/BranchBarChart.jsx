const BranchBarChart = ({ data = [], valueKey, format = (v) => v }) => {
    if (!data.length) {
        return <p className="text-sm text-muted-foreground py-8 text-center">No sales in this period.</p>;
    }
    const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
    const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);

    return (
        <div className="flex flex-col gap-3">
            {sorted.map((b) => (
                <div key={b.branchId} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3">
                    <span className="text-sm font-medium truncate">{b.branchName}</span>
                    <div className="h-6 bg-muted rounded">
                        <div
                            className="h-full bg-primary rounded transition-all duration-500"
                            style={{ width: `${(b[valueKey] / max) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm tabular-nums text-right min-w-[6rem]">{format(b[valueKey])}</span>
                </div>
            ))}
        </div>
    );
};
export default BranchBarChart;