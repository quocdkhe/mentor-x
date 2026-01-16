import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SchedulesTableSkeleton() {
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] text-center">Học viên</TableHead>
            <TableHead className="text-center">Thời gian</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx}>
              {/* Student Info */}
              <TableCell className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>

              {/* Time */}
              <TableCell className="text-center py-4">
                <div className="flex flex-col gap-2 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell className="text-center py-4">
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-center py-4">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default SchedulesTableSkeleton;
