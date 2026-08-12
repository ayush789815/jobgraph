export default function SelectField({ label, value, onChange, options, placeholder, className = '' }) {
  return (
    <label className={className}>
      {label && <span className="label">{label}</span>}
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
