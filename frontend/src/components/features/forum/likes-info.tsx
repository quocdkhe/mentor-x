export default function LikesInfo({ likers }: { likers: { name: string }[] }) {
  if (!likers || likers.length === 0) return null;

  const count = likers.length;
  const first = likers[0].name;
  const second = likers[1]?.name;

  let textContent;

  if (count === 1) {
    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span> liked this
      </span>
    );
  } else if (count === 2) {
    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span> and{' '}
        <span className="font-semibold text-foreground">{second}</span> liked this
      </span>
    );
  } else {
    const othersCount = count - 2;
    textContent = (
      <span>
        <span className="font-semibold text-foreground">{first}</span>,{' '}
        <span className="font-semibold text-foreground">{second}</span> and{' '}
        <span className="font-semibold text-foreground">{othersCount} others</span> liked this
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
