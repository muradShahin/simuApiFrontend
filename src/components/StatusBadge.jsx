export default function StatusBadge({ code }) {
  const cat = Math.floor(code / 100);
  const cls = `badge badge-${cat}xx`;
  return <span className={cls}>{code}</span>;
}
