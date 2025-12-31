import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import LikesInfo from './likes-info';
import { cn } from '@/lib/utils';
import { useLikeOrDislikePost } from '@/api/forum';
import type { Post } from '@/types/forum';
import { useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
interface CommentCardProps {
  post: Post;
  commentNumber: number;
  onReplyClick?: (content: string) => void;
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

export function CommentCard({ post, commentNumber, onReplyClick }: CommentCardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false); // Track if content is overflowing - defaults to true to show button initially
  const [showToggle, setShowToggle] = useState(true);
  const [likers, setLikers] = useState<{ name: string }[]>(post.likes);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const likeOrDislikePostMutation = useLikeOrDislikePost(post.id);
  const isLiked = likers.some((liker) => liker.name === user?.name);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelection(null);
        window.getSelection()?.removeAllRanges();
      }
    };

    if (selection) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selection]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setSelection(null);
        return;
      }

      // Check if the selection is within the content container
      if (contentRef.current && contentRef.current.contains(sel.anchorNode)) {
        const containerRect = contentRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setSelection({
            text: sel.toString().trim(),
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top,
          });
        }
      }
    } else {
      setSelection(null);
    }
  };

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
        queryClient.removeQueries({
          queryKey: ['forum-topic-posts'],
        });
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

  function handleReplyClick() {
    onReplyClick?.(`
      <blockquote>
        <strong>@${post.author.name}</strong>:<br/>
        ${post.content}
      </blockquote>
      <p>&nbsp;</p>
    `);
  }

  function handleReplyToSelection() {
    if (selection) {
      onReplyClick?.(`
        <blockquote>
          <strong>@${post.author.name}</strong>:<br/>
          ${selection.text}
        </blockquote>
      `);
      setSelection(null);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Left Side: User Info */}
        <div className="flex flex-col items-center gap-3 shrink-0 w-28">
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
          <div className="mb-4" onMouseUp={handleMouseUp}>
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

              {/* Selection context menu */}
              {selection && (
                <div
                  ref={menuRef}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="absolute z-50 bg-popover text-popover-foreground rounded shadow-lg border p-1 flex items-center animate-in fade-in zoom-in duration-200"
                  style={{
                    left: `${selection.x}px`,
                    top: `${selection.y - 10}px`, // Slightly above the selection
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 gap-1 text-xs font-medium cursor-pointer"
                    onClick={handleReplyToSelection}
                  >
                    <Quote className="h-3 w-3" />
                    Trích dẫn
                  </Button>
                </div>
              )}

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
                onClick={handleReplyClick}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Trả lời</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}