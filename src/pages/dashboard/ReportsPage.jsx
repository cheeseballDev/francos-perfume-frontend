import { reportColumnsRevenue, reportColumnsUnitsSold } from "@/components/features/report_components/ReportColumns";
import ReportTableSkeleton from "@/components/loaders/ReportTableSkeleton";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useReport } from "@/hooks/report_hooks/useReport";
import { useExportReport } from "@/hooks/transaction_hooks/useExportReport";
import { FileDown } from "lucide-react";
import { useState } from "react";

const ReportsPage = () => {
    const { toast } = useToast();
    const {
        bestSellingByRevenue,
        bestSellingByUnitsSold,
        worstSellingByRevenue,
        worstSellingByUnitsSold,
        asyncState,
        filter
    } = useReport();

    const {
        exportSalesReport,
    } = useExportReport();

    const [isDownloading, setIsDownloading] = useState(false);

    const handleExportList = async () => {
        setIsDownloading(true);
        try {
            // CAN ADD DATE FROM DATE TO HERE
            await exportSalesReport(filter);
            toast({
                title: "Success",
                description: "Successfully downloaded the list."
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: `An error occurred while downloading the list.\n${error.response?.data}`,
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
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-foreground leading-none mb-2">Sales Reports</h1>
                        <p className="text-muted-foreground text-sm">View the best selling and worst selling products by revenue or units sold.</p>
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
                        <FileDown className='h-4 w-4 mr-2'/>
                        Export Top 10 Sales List
                    </Button>
                </div>
                
            </div>
        </>
    )
}

export default ReportsPage;