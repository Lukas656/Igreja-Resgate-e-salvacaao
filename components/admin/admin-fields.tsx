import type { ReactNode } from "react";

export function Field({ label, children, help, className = "" }: { label: string; children: ReactNode; help?: string; className?: string }) {
  return <label className={`admin-field ${className}`}><span className="admin-field-label">{label}</span>{children}{help ? <small>{help}</small> : null}</label>;
}

type TextFieldProps = { label: string; value: string; onChange: (value: string) => void; type?: "text" | "url" | "time" | "date" | "email" | "number"; placeholder?: string; help?: string; min?: number; max?: number; className?: string };
export function TextField({ label, value, onChange, type = "text", placeholder, help, min, max, className }: TextFieldProps) {
  return <Field label={label} help={help} className={className}><input className="admin-input" type={type} value={value} placeholder={placeholder} min={min} max={max} onChange={(event) => onChange(event.target.value)} /></Field>;
}

type TextAreaProps = { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string; help?: string };
export function TextArea({ label, value, onChange, rows = 4, placeholder, help }: TextAreaProps) {
  return <Field label={label} help={help}><textarea className="admin-input admin-textarea" value={value} rows={rows} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></Field>;
}

type SelectFieldProps = { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; help?: string };
export function SelectField({ label, value, options, onChange, help }: SelectFieldProps) {
  return <Field label={label} help={help}><select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>;
}

export function EditorCard({ title, children, onRemove, removeLabel = "Remover" }: { title: string; children: ReactNode; onRemove?: () => void; removeLabel?: string }) {
  return <article className="admin-editor-card"><div className="admin-editor-card-heading"><h3>{title}</h3>{onRemove ? <button className="admin-remove-button" type="button" onClick={onRemove}>{removeLabel}</button> : null}</div>{children}</article>;
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="admin-add-button" type="button" onClick={onClick}>+ {children}</button>;
}
