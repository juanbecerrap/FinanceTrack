export default function Field({ label, htmlFor, error, optional = false, children }) {
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span className="field-optional"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
