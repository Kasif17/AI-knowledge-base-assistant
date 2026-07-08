import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-ink/50">
        Page {page} of {totalPages} - {total} total
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FiChevronLeft size={16} /> Prev
        </button>
        <button
          className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
