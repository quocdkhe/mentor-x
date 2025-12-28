import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import LikesInfo from './likes-info';
import { cn } from '@/lib/utils';
import { useLikeOrDislikePost } from '@/api/forum';
import type { Post } from '@/types/forum';
import { useAppSelector } from '@/store/hooks';
interface CommentCardProps {
  post: Post;
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

// Maximum height for collapsed content
const MAX_HEIGHT = 160;

export function CommentCard({ post, commentNumber }: CommentCardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);
  // Track if content is overflowing - defaults to true to show button initially
  const [showToggle, setShowToggle] = useState(true);
  const [likers, setLikers] = useState<{ name: string }[]>(post.likes);
  const contentRef = useRef<HTMLDivElement>(null);
  const likeOrDislikePostMutation = useLikeOrDislikePost(post.id);

  const isLiked = likers.some((liker) => liker.name === user?.name);

  // Callback ref to check overflow when element is mounted/updated
  const handleContentRef = (node: HTMLDivElement | null) => {
    contentRef.current = node;
    if (node) {
      setShowToggle(node.scrollHeight > MAX_HEIGHT);
    }
  };

  function handeLikeOrDislikePost() {
    likeOrDislikePostMutation.mutate(undefined, {
      onSuccess: () => {
        if (isLiked) {
          setLikers((prev) => prev.filter((liker) => liker.name !== user?.name));
        } else {
          setLikers((prev) => [...prev, { name: user?.name || 'Bạn' }]);
        }
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Left Side: User Info */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="text-xl">
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm">{post.author.name}</p>
            <Badge variant="secondary" className="text-xs">
              {post.author.role}
            </Badge>
          </div>
        </div>

        <Separator orientation="vertical" className="h-auto" />

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">{formatDate(post.timestamp)}</p>
            <span className="text-sm text-muted-foreground">#{commentNumber}</span>
          </div>

          {/* Body with HTML Support and Truncation */}
          <div className="mb-4">
            {/* Content container with gradient overlay */}
            <div className="relative">
              <div
                ref={handleContentRef}
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none transition-all duration-300 ease-in-out overflow-hidden",
                  // Apply max height only when collapsed and content overflows
                  !isExpanded && showToggle ? `max-h-40` : ""
                )}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Gradient overlay - only shows when collapsed and overflowing */}
              {!isExpanded && showToggle && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              )}
            </div>

            {/* Toggle Button - centered and outside the gradient area */}
            {showToggle && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-0 h-auto font-semibold text-primary/80 hover:text-primary cursor-pointer"
                >
                  {isExpanded ? (
                    <span className="flex items-center gap-1">
                      Thu gọn <ChevronUp className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Xem thêm <ChevronDown className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Separator between content and interaction area */}
          <Separator className="mb-4 mt-auto" />

          {/* Footer Area */}
          <div>
            {/* Likes Summary Box */}
            <LikesInfo likers={likers} />

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto p-0 gap-2 hover:bg-transparent hover:text-primary cursor-pointer",
                  isLiked && "text-primary font-bold"
                )}
                onClick={handeLikeOrDislikePost}
              >
                <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="font-medium">Like {likers.length > 0 && `(${likers.length})`}</span>
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