import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, MessageSquare } from 'lucide-react';

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

interface CommentCardProps {
  comment: Comment;
  commentNumber: number;
}

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
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[date.getDay()]} lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

export function CommentCard({ comment, commentNumber }: CommentCardProps) {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback className="text-xl">
              {getInitials(comment.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm">{comment.author.name}</p>
            <Badge variant="secondary" className="text-xs">
              {comment.author.role}
            </Badge>
          </div>
        </div>

        <Separator orientation="vertical" className="h-auto" />

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted-foreground">{formatDate(comment.timestamp)}</p>
            <span className="text-sm text-muted-foreground">#{commentNumber}</span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button variant="link" size="sm" className="h-auto p-0">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button variant="link" size="sm" className="h-auto p-0">
              <MessageSquare className="h-4 w-4 mr-2" />
              Trả lời
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
