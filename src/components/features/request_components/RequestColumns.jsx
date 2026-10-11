const STATUS_STYLES = {
  'PENDING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'FOR DISPATCH': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'IN TRANSIT': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'APPROVED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'COMPLETED': 'bg-green-500/10 text-green-500 border-green-500/20',
  'REJECTED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const STAGE_STYLES = {
  'DESTINATION BRANCH MANAGER': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  'SOURCE BRANCH MANAGER': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'OWNER': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
};

export const requestColumns = [
    {
        header: "Request ID",
        accessorKey: "requestDisplayId"
    },
    {
        id: 'route',
        header: 'From → To',
        render: (row) => {
            const { requestedFrom, deliveredTo } = row || {};
            return `${requestedFrom} → ${deliveredTo}`
        }
    },
    {
        id: 'status',
        header: 'Status',
        render: (row) => {
            const status = row?.requestStatus || "N/A";
            const style = STATUS_STYLES[status] || "bg-muted text-muted-foreground border-border"; 
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
                    {status}
                </span>
            );
        }
    },
    {
        header: 'Item Count',
        accessorKey: 'itemCount'
    },
    {
        header: "Stage",
        render: (row) => {
            const stage = row?.requestStage || "N/A";
            const style = STAGE_STYLES[stage] || "bg-muted text-muted-foreground border-border";
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
                    {stage}
                </span>
            )
        }
    },
]