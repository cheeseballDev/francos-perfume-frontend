import SensitiveText from '@/components/shared/SensitiveText';
import { ArrowRight } from 'lucide-react';

export const parseAuditChanges = (log) => {
    const raw = log?.changes ?? log?.logDetails;
    if (!raw) return [];
    let list = raw;
    if (typeof raw === 'string') {
        try {
            list = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(list)) return [];
    return list
        .map((change) => ({
            field: change.field ?? change.Field ?? '',
            before: change.before ?? change.Before ?? change.oldValue ?? null,
            after: change.after ?? change.After ?? change.newValue ?? null,
        }))
        .filter((change) => change.field);
};

const ChangeValue = ({ field, value }) => {
    if (value === null || value === undefined || value === '') {
        return <span className="italic text-muted-foreground">Empty</span>;
    }
    if (/email/i.test(field)) return <SensitiveText value={String(value)} />;
    return <span className="break-words">{String(value)}</span>;
};

const AuditLogChanges = ({ log }) => {
    const changes = parseAuditChanges(log);
    if (changes.length === 0) return null;

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-2">Changes</p>
            <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="text-left font-medium px-3 py-2 w-1/4">Field</th>
                            <th className="text-left font-medium px-3 py-2">Previous</th>
                            <th className="w-6" aria-hidden="true"></th>
                            <th className="text-left font-medium px-3 py-2">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {changes.map((change, index) => (
                            <tr key={`${change.field}-${index}`} className="border-t border-border align-top">
                                <td className="px-3 py-2 font-semibold text-foreground">{change.field}</td>
                                <td className="px-3 py-2 text-muted-foreground line-through decoration-destructive/60">
                                    <ChangeValue field={change.field} value={change.before} />
                                </td>
                                <td className="py-2 text-muted-foreground"><ArrowRight size={14} /></td>
                                <td className="px-3 py-2 font-medium text-foreground">
                                    <ChangeValue field={change.field} value={change.after} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogChanges;
