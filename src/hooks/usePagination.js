import { useMemo, useState, useEffect } from 'react';

export function usePagination(items, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const data = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const next = () => setPage(p => Math.min(p + 1, totalPages));
  const prev = () => setPage(p => Math.max(p - 1, 1));
  const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return { data, page: currentPage, pageSize, setPageSize, total, totalPages, next, prev, go };
}

