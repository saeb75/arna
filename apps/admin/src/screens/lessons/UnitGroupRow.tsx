import { TableCell, TableRow } from "@/components/ui/table";

/** Ünite ayraç satırı + altındaki ders satırları (tbody içinde fragment) */
export function UnitGroupRow({
  unitIndex,
  title,
  count,
  children,
}: {
  unitIndex: number;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell colSpan={6} className="py-1.5 pl-4 text-xs font-medium text-muted-foreground">
          Ünite {unitIndex} · <span className="text-foreground">{title}</span>
          <span className="ml-2 tabular-nums">({count})</span>
        </TableCell>
      </TableRow>
      {children}
    </>
  );
}
