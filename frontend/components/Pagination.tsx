export default function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return <div className="pagination-summary">{total} result{total === 1 ? "" : "s"}</div>;
  return <div className="pagination"><span>{total} results</span><button className="secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="secondary" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button></div>;
}
