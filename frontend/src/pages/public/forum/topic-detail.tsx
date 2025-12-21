import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentCard } from '@/components/forum/comment-card'
import { ArrowLeft } from 'lucide-react';
import { createLazyRoute, getRouteApi } from '@tanstack/react-router';
import { formatDate } from '@/lib/utils';
import TextEditor from '@/components/forum/text-editor';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}


const mockTopic = {
  id: 1,
  title: 'FE - ENT503',
  type: 'Hỏi Đáp',
  dateCreated: '2024-01-15T09:41:00',
};

const mockComments: Comment[] = [
  {
    id: 1,
    author: {
      name: 'ATho143',
      role: 'FPT Student',
    },
    content:
      'Cho mình hỏi môn PMG201c retake FE mới năm có bị out suốt so với thì lần 1 không ạ 🤔',
    timestamp: '2024-01-11T21:27:00',
    likes: 0,
  },
  {
    id: 2,
    author: {
      name: 'nguyenvan',
      role: 'FPT Student',
    },
    content:
      'Theo mình biết thì đề retake thường khó hơn một chút so với lần đầu, nhưng không quá nhiều. Quan trọng là bạn cần ôn kỹ những phần đã sai ở lần trước.',
    timestamp: '2024-01-11T21:35:00',
    likes: 3,
  },
  {
    id: 3,
    author: {
      name: 'hoangminh',
      role: 'Mentor',
    },
    content:
      'Chào bạn! Mình là mentor môn PMG201c. Đề retake sẽ có độ khó tương đương với đề chính, nhưng format câu hỏi có thể khác một chút. Bạn nên focus vào các concepts chính và làm thêm bài tập để quen với nhiều dạng câu hỏi nhé.',
    timestamp: '2024-01-11T22:10:00',
    likes: 12,
  },
  {
    id: 4,
    author: {
      name: 'thitle',
      role: 'FPT Student',
    },
    content:
      'Mình cũng vừa retake môn này học kỳ trước. Cảm giác đề không khó hơn lần đầu đâu, chỉ là mình cần chuẩn bị kỹ hơn thôi. Chúc bạn thi tốt!',
    timestamp: '2024-01-11T22:45:00',
    likes: 5,
  },
];



const route = getRouteApi('/public/forum/topic/$topicId');


export function TopicDetail() {
  const { topicId } = route.useParams();
  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-6">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>

        <div className="space-y-3">
          <Badge variant="outline" className="text-sm">
            #{topicId} {mockTopic.type}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{mockTopic.title}</h1>
          <p className="text-muted-foreground">{formatDate(mockTopic.dateCreated)}</p>
        </div>

        <div className="space-y-4">
          {mockComments.map((comment, index) => (
            <CommentCard key={comment.id} comment={comment} commentNumber={index + 1} />
          ))}
        </div>

        <TextEditor />
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum/topic/$topicId')({
  component: TopicDetail
})
