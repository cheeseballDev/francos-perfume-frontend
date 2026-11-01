import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateForTable, formatDateTimeForTable } from "@/utils/formattingUtils";
import { AlertTriangle, ArrowRightLeft, CalendarDays, Clock, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SectionTitle = ({ icon: Icon, children }) => (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        <Icon size={14} /> {children}
    </p>
);

const FactsFallback = ({ facts }) => (
    <ul className="text-sm text-foreground space-y-1.5">
        <li>Predicted demand: <strong>{facts.predictedUnitsForMonth}</strong> units this month (about {facts.predictedDailyUnits} a day)</li>
        <li>Current stock: <strong>{facts.currentStock}</strong> units</li>
        {facts.estimatedStockoutDate && (
            <li>Estimated to run out around <strong>{formatDateForTable(facts.estimatedStockoutDate)}</strong></li>
        )}
        {facts.recommendedOrderQuantity > 0 && (
            <li>Recommended to request <strong>{facts.recommendedOrderQuantity}</strong> units</li>
        )}
    </ul>
);

const ForecastInsightsCard = ({ insightsState, onRefresh }) => {
    const navigate = useNavigate();
    const { result, isLoading, error } = insightsState;

    const facts = result?.facts;
    const insights = result?.insights;

    const openTransfer = (action) => {
        navigate("/home/requests/create", {
            state: {
                prefill: {
                    fromBranch: action.fromBranchId,
                    toBranch: facts.branchId,
                    items: [{ productId: facts.productId, productName: facts.productName, quantity: action.quantity }],
                },
            },
        });
    };

    return (
        <Card className="p-6 mb-6 border-border bg-card shadow-sm shrink-0">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-emerald-500" size={18} />
                            <CardTitle className="text-base text-foreground">AI Insights</CardTitle>
                        </div>
                        <CardDescription>
                            Claude explains the ML.NET forecast and suggests what to do. All numbers come from the system.
                        </CardDescription>
                    </div>
                    {result && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                {result.cached ? "Saved" : "Generated"} {formatDateTimeForTable(result.generatedAt)}
                            </span>
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                                {isLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                                Refresh
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-2 flex flex-col gap-6">
                {isLoading && !result && (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}

                {!isLoading && error && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle size={14} /> {error}
                    </p>
                )}

                {facts && !insights && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            {result.insightError || "AI insights are unavailable right now."} Showing the forecast figures instead.
                        </p>
                        <FactsFallback facts={facts} />
                    </div>
                )}

                {insights && (
                    <>
                        {insights.summary && (
                            <p className="text-sm leading-relaxed text-foreground">{insights.summary}</p>
                        )}

                        {insights.stockout?.atRisk && (
                            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                                <Clock size={18} className="text-amber-500 mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">
                                        {insights.stockout.estimatedDate
                                            ? `Stock may run out around ${formatDateForTable(insights.stockout.estimatedDate)}`
                                            : "Stock is low"}
                                        {insights.stockout.daysLeft != null && ` (about ${insights.stockout.daysLeft} days left)`}
                                    </p>
                                    {insights.stockout.message && <p className="text-muted-foreground mt-0.5">{insights.stockout.message}</p>}
                                </div>
                            </div>
                        )}

                        {insights.actions?.length > 0 && (
                            <div>
                                <SectionTitle icon={ArrowRightLeft}>Suggested actions</SectionTitle>
                                <div className="flex flex-col gap-2">
                                    {insights.actions.map((action) => (
                                        <div key={action.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                                            <div className="text-sm min-w-0">
                                                <p className="font-semibold text-foreground">
                                                    {action.type === "TRANSFER"
                                                        ? `Request ${action.quantity} units from ${action.fromBranchName}`
                                                        : `Reorder ${action.quantity} units`}
                                                </p>
                                                {action.message && <p className="text-muted-foreground mt-0.5">{action.message}</p>}
                                            </div>
                                            {action.type === "TRANSFER" && action.fromBranchId && (
                                                <Button size="sm" onClick={() => openTransfer(action)}>
                                                    Create transfer request
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {insights.expiryRisks?.length > 0 && (
                            <div>
                                <SectionTitle icon={AlertTriangle}>Expiry risk</SectionTitle>
                                <ul className="flex flex-col gap-2">
                                    {insights.expiryRisks.map((risk) => (
                                        <li key={risk.key} className="text-sm rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                            <p className="font-semibold text-foreground">
                                                {risk.alreadyExpired
                                                    ? `${risk.unitsAtRisk} units from ${risk.batchDisplayId || `batch ${risk.batchId}`} are past their sell-by date deadline`
                                                    : `${risk.unitsAtRisk} units from ${risk.batchDisplayId || `batch ${risk.batchId}`} may not sell before ${formatDateForTable(risk.expiryDate)}`}
                                            </p>
                                            {risk.message && <p className="text-muted-foreground mt-0.5">{risk.message}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {insights.outsideFactors?.length > 0 && (
                            <div>
                                <SectionTitle icon={CalendarDays}>Things that may affect demand</SectionTitle>
                                <ul className="list-disc pl-5 text-sm text-foreground space-y-1">
                                    {insights.outsideFactors.map((factor, index) => <li key={index}>{factor}</li>)}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ForecastInsightsCard;
