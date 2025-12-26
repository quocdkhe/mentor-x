import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { createLazyRoute, Link } from "@tanstack/react-router";
import { formatDate, getInitials } from "@/lib/utils";
import { useGetTopicPagination } from "@/api/forum";
import { ApiPagination } from "@/components/api-pagination";
import { ForumTableSkeleton } from "@/components/skeletons/forum-table-skeleton";
import { TOPIC_TYPES, type TopicType } from "@/types/forum";
import type { VariantProps } from "class-variance-authority";

function getTopicTypeMeta(
  type: TopicType
): { label: string; variant: VariantProps<typeof Badge>["variant"] } {
  switch (type) {
    case TOPIC_TYPES.QUESTION_AND_ANSWER:
      return { label: "Hỏi & Đáp", variant: "default" };

    case TOPIC_TYPES.NEWS:
      return { label: "Tin tức", variant: "secondary" };

    case TOPIC_TYPES.DISCUSSIOIN:
      return { label: "Thảo luận", variant: "outline" };

    case TOPIC_TYPES.SUGGESTION:
      return { label: "Đề xuất", variant: "destructive" };

    default:
      return { label: "Khác", variant: "outline" };
  }
}

export function ForumListing() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError } = useGetTopicPagination(currentPage, pageSize);

  if (isLoading) {
    return <ForumTableSkeleton />;
  }
  if (isError || !data) {
    return <div className="p-6 text-red-500">Failed to load topics</div>;
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const { items, totalItems, currentPage: page } = data;
  const startIndex = (page - 1) * pageSize;

  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Đang hiển thị {startIndex + 1} đến{" "}
            {Math.min(startIndex + items.length, totalItems)} trong tổng số {" "}
            {totalItems} chủ đề
          </div>

          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Topic
          </Button>
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
              {items.map(function (topic, index) {
                const { label, variant } = getTopicTypeMeta(topic.type);

                return <TableRow key={topic.id} className="[&_td]:py-4">
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>

                  <TableCell>
                    <Link
                      to="/forum/topic/$topicId"
                      params={{ topicId: topic.id }}
                      className="font-medium hover:underline"
                    >
                      {topic.title}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Badge variant={variant}>{label}</Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDate(topic.dateCreated.toString())}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={topic.author.avatar} />
                        <AvatarFallback>
                          {getInitials(topic.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {topic.author.name}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              })
              }
            </TableBody>
          </Table>
        </div>


        {/* Pagination */}
        <ApiPagination
          pagination={data}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum')({ component: ForumListing });
