import { FormEvent, ReactNode, useState } from "react";
import { Record, Zone } from "../../lib/api";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}><div className="modal-title"><h2>{title}</h2><button className="close" aria-label="Close" onClick={onClose}>×</button></div>{children}</section></div>; }
type ZoneData = { domain_name: string; description: string; is_private: boolean };
export function ZoneForm({ zone, onSave, onClose }: { zone?: Zone; onSave: (data: ZoneData) => Promise<void>; onClose: () => void }) { const [domain, setDomain] = useState(zone?.domain_name || ""); const [description, setDescription] = useState(zone?.description || ""); const [privateZone, setPrivate] = useState(zone?.is_private || false); const [saving, setSaving] = useState(false); const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); try { await onSave({ domain_name: domain, description, is_private: privateZone }); } finally { setSaving(false); } }; return <Modal title={zone ? "Edit hosted zone" : "Create hosted zone"} onClose={onClose}><form onSubmit={submit}><label>Domain name<input required disabled={Boolean(zone)} placeholder="example.com" value={domain} onChange={event => setDomain(event.target.value)} /></label>{zone && <p className="hint">The domain name cannot be changed after a hosted zone is created.</p>}<label>Description <input placeholder="Optional description" value={description} onChange={event => setDescription(event.target.value)} /></label><label className="check"><input type="checkbox" checked={privateZone} onChange={event => setPrivate(event.target.checked)} /> Private hosted zone</label><div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button disabled={saving}>{saving ? "Saving..." : zone ? "Save changes" : "Create hosted zone"}</button></div></form></Modal>; }
export function RecordForm({ record, onSave, onClose }: { record?: Record; onSave: (data: Omit<Record, "id" | "created_at">) => Promise<void>; onClose: () => void }) { const [data, setData] = useState({ name: record?.name || "", type: record?.type || "A", value: record?.value || "", ttl: record?.ttl || 300, description: record?.description || "" }); const [saving, setSaving] = useState(false); const change = (key: string, value: string | number) => setData({ ...data, [key]: value }); const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); try { await onSave(data); } finally { setSaving(false); } }; return <Modal title={record ? "Edit record" : "Create record"} onClose={onClose}><form onSubmit={submit}><label>Record name<input required placeholder="www" value={data.name} onChange={event => change("name", event.target.value)} /></label><div className="form-grid"><label>Record type<select value={data.type} onChange={event => change("type", event.target.value)}>{["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"].map(type => <option key={type}>{type}</option>)}</select></label><label>TTL (seconds)<input required type="number" min="0" value={data.ttl} onChange={event => change("ttl", Number(event.target.value))} /></label></div><label>Value<input required placeholder="192.0.2.1" value={data.value} onChange={event => change("value", event.target.value)} /></label><label>Description<input value={data.description || ""} onChange={event => change("description", event.target.value)} /></label><div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button disabled={saving}>{saving ? "Saving..." : "Save record"}</button></div></form></Modal>; }

export function ImportBindModal({ onImport, onClose }: { onImport: (bindText: string) => Promise<void>; onClose: () => void }) {
  const [bindText, setBindText] = useState("");
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBindText((event.target?.result as string) || "");
      };
      reader.readAsText(file);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bindText.trim()) return;
    setImporting(true);
    try {
      await onImport(bindText);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal title="Import DNS records from BIND zone file" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Upload BIND file (.zone / .txt)
          <input type="file" accept=".zone,.txt,.text" onChange={handleFileUpload} />
        </label>
        <label>
          Or paste BIND zone content
          <textarea
            required
            rows={8}
            placeholder={`$ORIGIN example.com.\n$TTL 300\n@ IN A 192.0.2.1\nwww IN A 192.0.2.2\nmail IN MX 10 mail.example.com.`}
            value={bindText}
            onChange={(e) => setBindText(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", background: "#111c2b", color: "#f4f7fb", border: "1px solid #4a5c72", fontFamily: "monospace", fontSize: "13px" }}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button disabled={importing || !bindText.trim()}>
            {importing ? "Importing..." : "Import Records"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

