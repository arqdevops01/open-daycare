import { FEED_HEADER } from "@/lib/feed";

interface FeedHeaderProps {
  firstName: string;
}

export function FeedHeader({ firstName }: FeedHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
        {FEED_HEADER.eyebrow}
      </div>
      <h1 className="m-0 font-display text-[30px] font-semibold text-ink">
        Buenas, {firstName}
      </h1>
      <p className="mt-[5px] text-[14.5px] text-soft">{FEED_HEADER.meta}</p>
    </div>
  );
}
