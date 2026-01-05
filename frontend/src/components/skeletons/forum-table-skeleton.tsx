import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ForumTableSkeleton() {
  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-left">#</TableHead>
                <TableHead className="text-left">Chủ đề</TableHead>
                <TableHead className="w-48 text-left">Thể loại</TableHead>
                <TableHead className="w-60 text-left">Ngày tạo</TableHead>
                <TableHead className="w-60 text-left">Tác giả</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="[&_td]:py-4">
                  {/* # */}
                  <TableCell>
                    <Skeleton className="h-4 w-6" />
                  </TableCell>

                  {/* Topic */}
                  <TableCell>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>

                  {/* Date Created */}
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>

                  {/* Author */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

  );
}
