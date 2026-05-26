import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getHref = (page: number) => `${basePath}?page=${page}`;

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Link
        href={getHref(currentPage - 1)}
        className={`px-3 py-1.5 rounded text-custom-sm ${
          currentPage <= 1
            ? "pointer-events-none text-gray-4"
            : "text-body hover:text-dark hover:bg-gray-1"
        }`}
      >
        ← Prev
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={getHref(page)}
          className={`px-3 py-1.5 rounded text-custom-sm font-medium ${
            page === currentPage
              ? "bg-blue text-white"
              : "text-body hover:bg-gray-1"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={getHref(currentPage + 1)}
        className={`px-3 py-1.5 rounded text-custom-sm ${
          currentPage >= totalPages
            ? "pointer-events-none text-gray-4"
            : "text-body hover:text-dark hover:bg-gray-1"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}
