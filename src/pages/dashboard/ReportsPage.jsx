import { reportColumnsRevenue, reportColumnsUnitsSold } from "@/components/features/report_components/ReportColumns";
import ReportTableSkeleton from "@/components/loaders/ReportTableSkeleton";
import DataTable from "@/components/shared/DataTable";
import PeriodSelect from "@/components/shared/PeriodSelect";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useReport } from "@/hooks/report_hooks/useReport";
import { useExportReport } from "@/hooks/transaction_hooks/useExportReport";
import { formatPeriodRange, getPeriodOption } from "@/utils/periodUtils";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { getAPIError } from "@/utils/apiErrorUtils";

const ReportsPage = () => {
    const { toast } = useToast();
    const {
        bestSellingByRevenue,
        bestSellingByUnitsSold,
        worstSellingByRevenue,
        worstSellingByUnitsSold,
        asyncState,
        filter,
        period,
        setPeriod
    } = useReport();

    const {
        exportSalesReport,
    } = useExportReport();

    const [isDownloading, setIsDownloading] = useState(false);

    const handleExportList = async () => {
        setIsDownloading(true);
        try {
            await exportSalesReport(filter);
            toast({
                title: "Success",
                description: `Downloaded the top 10 sales list for ${getPeriodOption(period).shortLabel}.`
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: `An error occurred while downloading the list.\n${getAPIError(error)}`,
                variant: "destructive",
                duration: 5000
            });
        } finally {
            setIsDownloading(false);
        }
    }
    
    return (
        <>
        
            <div className="bg-background min-h-screen font-montserrat flex flex-col animate-fade-in relative">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-foreground leading-none mb-2">Sales Reports</h1>
                        <p className="text-muted-foreground text-sm">View the best selling and worst selling products by revenue or units sold.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Showing {getPeriodOption(period).shortLabel}: {formatPeriodRange(period)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {asyncState.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <PeriodSelect value={period} onChange={setPeriod} disabled={isDownloading} />
                    </div>
                </div>

                <section className="mb-4">
                    <h2 className="text-center text-2xl font-bold text-foreground mb-6">Top 10 Best Selling by REVENUE</h2>
                    {asyncState.isLoading ? (
                        <ReportTableSkeleton />
                        ) : (
                        <DataTable 
                            columns={reportColumnsRevenue}
                            data={bestSellingByRevenue}
                            keyField="productId"
                            asyncState={asyncState}
                            emptyMessage="No sales in this period."
                        />
                        )}
                </section>

                <section className="mb-4">
                    <h2 className="text-center text-2xl font-bold text-foreground mb-6">Top 10 Best Selling by UNITS SOLD</h2>
                    {asyncState.isLoading ? (
                        <ReportTableSkeleton />
                        ) : (
                        <DataTable 
                            columns={reportColumnsUnitsSold}
                            data={bestSellingByUnitsSold}
                            keyField="productId"
                            asyncState={asyncState}
                        />
                        )}
                </section>

                <section className="mb-4">
                    <h2 className="text-center text-2xl font-bold text-foreground mb-6">Top 10 Worst Selling by REVENUE</h2>
                    {asyncState.isLoading ? (
                        <ReportTableSkeleton />
                        ) : (
                        <DataTable 
                            columns={reportColumnsRevenue}
                            data={worstSellingByRevenue}
                            keyField="productId"
                            asyncState={asyncState}
                            emptyMessage="No sales in this period."
                        />
                        )}
                </section>

                <section className="mb-4">
                    <h2 className="text-center text-2xl font-bold text-foreground mb-6">Top 10 Worst Selling by UNITS SOLD</h2>
                    {asyncState.isLoading ? (
                        <ReportTableSkeleton />
                        ) : (
                        <DataTable 
                            columns={reportColumnsUnitsSold}
                            data={worstSellingByUnitsSold}
                            keyField="productId"
                            asyncState={asyncState}
                            emptyMessage="No sales in this period."
                        />
                        )}
                </section>
                
                <div className="mb-6 w-full">
                    <Button 
                        className="w-full"
                        onClick={() => handleExportList()}
                        disabled={isDownloading}
                        >
                        {isDownloading ? <Loader2 className='h-4 w-4 mr-2 animate-spin'/> : <FileDown className='h-4 w-4 mr-2'/>}
                        Export Top 10 Sales List ({getPeriodOption(period).label})
                    </Button>
                </div>
                
            </div>
        </>
    )
}

export default ReportsPage;