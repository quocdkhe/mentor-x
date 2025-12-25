import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import LikesInfo from './likes-info';

interface Author {
  name: string;
  avatar?: string;
  role: string;
}

interface Comment {
  id: number;
  author: Author;
  content: string;
  timestamp: string;
  likes: Author[];
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

export function CommentCard({ comment, commentNumber }: CommentCardProps) {

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Left Side: User Info */}
        <div className="flex flex-col items-center gap-3 shrink-0">
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

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">{formatDate(comment.timestamp)}</p>
            <span className="text-sm text-muted-foreground">#{commentNumber}</span>
          </div>

          {/* Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <p>{comment.content}</p>
          </div>

          {/* Separator between content and interaction area */}
          <Separator className="mb-4 mt-auto" />

          {/* Footer Area */}
          <div>
            {/* Likes Summary Box */}
            <LikesInfo likers={comment.likes} />

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 gap-2 hover:bg-transparent hover:text-primary cursor-pointer"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">Like {comment.likes.length > 0 && `(${comment.likes.length})`}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 gap-2 hover:bg-transparent hover:text-primary cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Reply</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}