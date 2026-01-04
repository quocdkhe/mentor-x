import { useAppSelector } from "@/store/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LikesInfo({ likers }: { likers: { name: string }[] }) {
  const { user } = useAppSelector((state) => state.auth);

  if (!likers || likers.length === 0) return null;

  const processedLikers = [...likers];
  const userIndex = processedLikers.findIndex((liker) => liker.name === user?.name);

  if (userIndex !== -1) {
    // Remove user from current position
    processedLikers.splice(userIndex, 1);
    // Add "Bạn" to the beginning
    processedLikers.unshift({ name: "Bạn" });
  }

  const count = processedLikers.length;
  const first = processedLikers[0].name;
  const second = processedLikers[1]?.name;

  let textContent;

  if (count === 1) {
    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span> đã thích bài viết này
      </span>
    );
  } else if (count === 2) {
    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span> và{' '}
        <span className="font-semibold text-foreground">{second}</span> đã thích bài viết này
      </span>
    );
  } else {
    const othersCount = count - 2;
    const otherLikers = processedLikers.slice(2);

    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span>,{' '}
        <span className="font-semibold text-foreground">{second}</span> và{' '}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-semibold text-foreground cursor-pointer hover:underline">
              {othersCount} người khác
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] break-words">
            <div className="flex flex-col gap-1">
              {otherLikers.map((liker, index) => (
                <span key={index}>{liker.name}</span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>{' '}
        đã thích bài viết này
      </span>
    );
  }

  // Just the box and text, no avatars
  return (
    <div className="bg-muted/40 rounded-md px-3 py-2 text-sm text-muted-foreground mb-3">
      {textContent}
    </div>
  );
};
