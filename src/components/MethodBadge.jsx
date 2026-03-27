export default function MethodBadge({ method }) {
  const cls = `badge badge-${(method ?? 'get').toLowerCase()}`;
  return <span className={cls}>{method}</span>;
}
