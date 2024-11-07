import { useCallback, useEffect, useRef } from 'react';

export const useInfiniteScroll = (onLoadMore: () => void, hasMore: boolean) => {
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!hasMore) return;

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        {
          rootMargin: '200px', // Load more when within 200px of the bottom
        }
      );

      if (node) observer.current.observe(node);
    },
    [hasMore, onLoadMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
};
