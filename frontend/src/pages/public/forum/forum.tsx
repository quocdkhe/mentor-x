import { useGetTopicPagination } from "@/api/forum";
import { ApiPagination } from "@/components/api-pagination";
import { AddTopicDialog } from "@/components/features/forum/add-topic-dialog";
import { ForumTableSkeleton } from "@/components/skeletons/forum-table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getInitials, getTopicTypeMeta } from "@/lib/utils";
import { createLazyRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { USER_ROLES } from "@/types/user";
import { Clock } from "lucide-react";

export function ForumListing() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const pageSize = 10;
  const { data, isLoading, isError } = useGetTopicPagination(
    currentPage,
    pageSize,
  );

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

  function handleRefetchAfterCreateTopic() {
    handlePageChange(1);
    queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
  }

  const { items, totalItems, currentPage: page } = data;
  const startIndex = (page - 1) * pageSize;

  return (
    <div className="container mx-auto px-4 pt-6 pb-20 min-h-screen">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Đang hiển thị {startIndex + 1} đến{" "}
            {Math.min(startIndex + items.length, totalItems)} trong tổng số{" "}
            {totalItems} chủ đề
          </div>
          <AddTopicDialog
            onRefetchAfterCreateTopic={handleRefetchAfterCreateTopic}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {items.map(function (topic) {
            const { label, variant } = getTopicTypeMeta(topic.type);
            const topicLink =
              user?.role === USER_ROLES.USER
                ? `/user/forum/topic/${topic.id}`
                : `/forum/topic/${topic.id}`;

            return (
              <Link key={topic.id} to={topicLink} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">{topic.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge
                        variant={variant}
                        className="rounded-sm px-1.5 py-0"
                      >
                        {label}
                      </Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatDate(topic.dateCreated.toString())}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={topic.author.avatar}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(topic.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground font-medium">
                        {topic.author.name}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
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

                return (
                  <TableRow key={topic.id} className="[&_td]:py-4">
                    <TableCell className="font-medium">
                      {startIndex + index + 1}
                    </TableCell>

                    <TableCell>
                      {user?.role === USER_ROLES.USER ? (
                        <Link
                          to="/user/forum/topic/$topicId"
                          params={{ topicId: topic.id }}
                          className="font-medium hover:underline"
                        >
                          {topic.title}
                        </Link>
                      ) : (
                        <Link
                          to="/forum/topic/$topicId"
                          params={{ topicId: topic.id }}
                          className="font-medium hover:underline"
                        >
                          {topic.title}
                        </Link>
                      )}
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
                          <AvatarImage
                            src={topic.author.avatar}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {getInitials(topic.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{topic.author.name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <ApiPagination pagination={data} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/public/forum")({
  component: ForumListing,
});

export const UserRoute = createLazyRoute("/user/forum")({
  component: ForumListing,
});
