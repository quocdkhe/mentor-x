import { createLazyRoute } from "@tanstack/react-router";
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlusCircle } from 'lucide-react';
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

interface Topic {
  id: number;
  title: string;
  type: string;
  dateCreated: string;
  author: {
    name: string;
    avatar?: string;
  };
}

const allMockTopics: Topic[] = [
  {
    id: 1,
    title: 'FE - ENT503',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-15T09:41:00',
    author: { name: 'bka' },
  },
  {
    id: 2,
    title: 'Học lại cousera để lấy điểm bonus',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T22:25:00',
    author: { name: 'vietdeptraI03' },
  },
  {
    id: 3,
    title: '[XAVALO – EXE101] Tuyển thêm 02 Mark',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T21:55:00',
    author: { name: 'someoneudn' },
  },
  {
    id: 4,
    title: 'Tìm đồng đội cho môn EXE101',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T09:45:00',
    author: { name: 'Djm3m1y' },
  },
  {
    id: 5,
    title: '[EXE101 IA1902-AS]',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T01:52:00',
    author: { name: 'al4dyTqWin' },
  },
  {
    id: 6,
    title: '[SWP391] tìm đồng đội môn SWP391 cơ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-13T23:59:00',
    author: { name: 'dangonthi' },
  },
  {
    id: 7,
    title: 'Đổi chéo lớp EXE101 mình hiện tại đang ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-11T17:40:00',
    author: { name: 'Trần Thùy Dung' },
  },
  {
    id: 8,
    title: 'TUYỂN THÀNH VIÊN IB CHO MÔN EXE10',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-11T09:07:00',
    author: { name: 'leminhuan' },
  },
  {
    id: 9,
    title: 'FTEST',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-10T19:07:00',
    author: { name: 'Phạm Nhật Duẩn' },
  },
  {
    id: 10,
    title: 'cái check điểm của hệ thống xác xuất lệch d',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-10T23:23:00',
    author: { name: 'CuIMan' },
  },
  {
    id: 11,
    title: 'Hỏi về deadline nộp assignment',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-09T15:30:00',
    author: { name: 'nguyenvan' },
  },
  {
    id: 12,
    title: 'Share tài liệu ôn thi giữa kỳ',
    type: 'Tài Liệu',
    dateCreated: '2024-01-09T10:20:00',
    author: { name: 'thitle' },
  },
  {
    id: 13,
    title: 'Tìm mentor cho project cuối kỳ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-08T18:45:00',
    author: { name: 'hoangminh' },
  },
  {
    id: 14,
    title: 'Review khóa học Java cơ bản',
    type: 'Thảo Luận',
    dateCreated: '2024-01-08T14:10:00',
    author: { name: 'phương' },
  },
  {
    id: 15,
    title: 'Câu hỏi về Database Design',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-07T20:30:00',
    author: { name: 'tuananh' },
  },
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to generate page numbers with ellipsis
const generatePageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 5; // Maximum number of page buttons to show

  if (totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
};

export function ForumListing() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(allMockTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTopics = allMockTopics.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-4">
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, allMockTopics.length)} of{' '}
            {allMockTopics.length} topics
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Topic
          </Button>
        </div>

        {/* Table section */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-left">#</TableHead>
                <TableHead className="text-left">Topic</TableHead>
                <TableHead className="w-32 text-left">Type</TableHead>
                <TableHead className="w-48 text-left">Date Created</TableHead>
                <TableHead className="w-48 text-left">Author</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTopics.map((topic, index) => (
                <TableRow key={topic.id}>
                  <TableCell className="text-left font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-left">
                    <Link
                      to="/forum/topic/$topicId"
                      params={{ topicId: topic.id.toString() }}
                      className="font-medium hover:underline"
                    >
                      {topic.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge variant="outline">{topic.type}</Badge>
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {formatDate(topic.dateCreated)}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={topic.author.avatar} />
                        <AvatarFallback>{getInitials(topic.author.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{topic.author.name}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination section */}
        <Pagination>
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {/* Page numbers */}
            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next button */}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum')({
  component: ForumListing
})