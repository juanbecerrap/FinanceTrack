export function Spinner({ size = 20 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="page-loader">
      <Spinner size={32} />
      <p>{label}</p>
    </div>
  );
}
