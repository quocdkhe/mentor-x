import {createLazyRoute} from "@tanstack/react-router";

import {useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {PlusCircle, ChevronLeft, ChevronRight} from 'lucide-react';

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
    author: {name: 'bka'},
  },
  {
    id: 2,
    title: 'Học lại cousera để lấy điểm bonus',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T22:25:00',
    author: {name: 'vietdeptraI03'},
  },
  {
    id: 3,
    title: '[XAVALO – EXE101] Tuyển thêm 02 Mark',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T21:55:00',
    author: {name: 'someoneudn'},
  },
  {
    id: 4,
    title: 'Tìm đồng đội cho môn EXE101',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T09:45:00',
    author: {name: 'Djm3m1y'},
  },
  {
    id: 5,
    title: '[EXE101 IA1902-AS]',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-14T01:52:00',
    author: {name: 'al4dyTqWin'},
  },
  {
    id: 6,
    title: '[SWP391] tìm đồng đội môn SWP391 cơ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-13T23:59:00',
    author: {name: 'dangonthi'},
  },
  {
    id: 7,
    title: 'Đổi chéo lớp EXE101 mình hiện tại đang ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-11T17:40:00',
    author: {name: 'Trần Thùy Dung'},
  },
  {
    id: 8,
    title: 'TUYỂN THÀNH VIÊN IB CHO MÔN EXE10',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-11T09:07:00',
    author: {name: 'leminhuan'},
  },
  {
    id: 9,
    title: 'FTEST',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-10T19:07:00',
    author: {name: 'Phạm Nhật Duẩn'},
  },
  {
    id: 10,
    title: 'cái check điểm của hệ thống xác xuất lệch d',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-10T23:23:00',
    author: {name: 'CuIMan'},
  },
  {
    id: 11,
    title: 'Hỏi về deadline nộp assignment',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-09T15:30:00',
    author: {name: 'nguyenvan'},
  },
  {
    id: 12,
    title: 'Share tài liệu ôn thi giữa kỳ',
    type: 'Tài Liệu',
    dateCreated: '2024-01-09T10:20:00',
    author: {name: 'thitle'},
  },
  {
    id: 13,
    title: 'Tìm mentor cho project cuối kỳ',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-08T18:45:00',
    author: {name: 'hoangminh'},
  },
  {
    id: 14,
    title: 'Review khóa học Java cơ bản',
    type: 'Thảo Luận',
    dateCreated: '2024-01-08T14:10:00',
    author: {name: 'phương'},
  },
  {
    id: 15,
    title: 'Câu hỏi về Database Design',
    type: 'Hỏi Đáp',
    dateCreated: '2024-01-07T20:30:00',
    author: {name: 'tuananh'},
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 0) {
    return `Hôm nay, lúc ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`;
  } else if (diffInDays === 1) {
    return `Hôm qua, lúc ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`;
  } else if (diffInDays <= 7) {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return `${days[date.getDay()]} lúc ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`;
  } else {
    return date.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
  }
};

export function ForumListing() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(allMockTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTopics = allMockTopics.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, allMockTopics.length)} of{' '}
            {allMockTopics.length} topics
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Create New Topic
          </Button>
        </div>

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
                    <a
                      href="#"
                      className="font-medium hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {topic.title}
                    </a>
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
                        <AvatarImage src={topic.author.avatar}/>
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4"/>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum')({
  component: ForumListing
})
