import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import RecordsTable from "../../components/RecordsTable";
import { RecordForm, ImportBindModal } from "../../components/Modals";
import Pagination from "../../components/Pagination";
import { useToast } from "../../components/Notifications";
import { api, downloadExport, Record, Zone } from "../../lib/api";

const PAGE_SIZE = 10;
export default function ZoneDetail() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const [zone, setZone] = useState<Zone | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [query, setQuery] = useState("");
  const [recordType, setRecordType] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const refresh = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([api<Zone>(`/api/hosted-zones/${id}`), api<Record[]>(`/api/dns-records/zone/${id}`)])
      .then(([nextZone, nextRecords]) => {
        setZone(nextZone);
        setRecords(nextRecords);
      })
      .catch(error => notify(error.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => setPage(1), [query, recordType]);

  const save = async (data: Omit<Record, "id" | "created_at">) => {
    if (editing) {
      await api(`/api/dns-records/record/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
      notify("DNS record updated.");
    } else {
      await api(`/api/dns-records/zone/${id}`, { method: "POST", body: JSON.stringify(data) });
      notify("DNS record created.");
    }
    setFormOpen(false);
    setEditing(undefined);
    refresh();
  };

  const handleImportBind = async (bindText: string) => {
    try {
      const res = await api<{ message: string; count: number }>(`/api/dns-records/zone/${id}/import-bind`, {
        method: "POST",
        body: JSON.stringify({ bind_text: bindText }),
      });
      notify(res.message);
      setImportOpen(false);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Unable to import BIND zone.", "error");
    }
  };

  const remove = async (recordId: string) => {
    if (!confirm("Delete this DNS record?")) return;
    try {
      await api(`/api/dns-records/record/${recordId}`, { method: "DELETE" });
      notify("DNS record deleted.");
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete record.", "error");
    }
  };

  const filtered = useMemo(
    () =>
      records.filter(
        record =>
          `${record.name} ${record.type} ${record.value}`.toLowerCase().includes(query.toLowerCase()) &&
          (recordType === "all" || record.type === recordType)
      ),
    [records, query, recordType]
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <div className="breadcrumbs">
        <Link href="/hosted-zones">Hosted zones</Link>
        <span>/</span>
        <span>{zone?.domain_name || "Hosted zone"}</span>
      </div>
      {loading ? (
        <div className="loading">Loading hosted zone...</div>
      ) : (
        zone && (
          <>
            <div className="page-header compact">
              <div>
                <span className="eyebrow">HOSTED ZONE</span>
                <h1>{zone.domain_name}</h1>
                <p>{zone.description || "Manage DNS records and delegated nameservers."}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button className="secondary" onClick={() => setImportOpen(true)}>
                  Import BIND
                </button>
                <button className="secondary" onClick={() => downloadExport(zone.id, zone.domain_name, "bind")}>
                  Export BIND
                </button>
                <button className="secondary" onClick={() => downloadExport(zone.id, zone.domain_name, "json")}>
                  Export JSON
                </button>
                <button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
                  Create record
                </button>
              </div>
            </div>
            <div className="zone-meta">
              <div>
                <span>Zone type</span>
                <b>{zone.is_private ? "Private hosted zone" : "Public hosted zone"}</b>
              </div>
              <div>
                <span>Zone ID</span>
                <b>{zone.id}</b>
              </div>
            </div>
            <section className="card">
              <div className="toolbar">
                <div>
                  <h2>Records ({records.length})</h2>
                  <p className="muted">DNS records determine how traffic is routed for your domain.</p>
                </div>
                <div className="toolbar-controls">
                  <input
                    className="search"
                    placeholder="Filter records"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
                  <select
                    className="filter"
                    value={recordType}
                    onChange={event => setRecordType(event.target.value)}
                  >
                    <option value="all">All record types</option>
                    {["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"].map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <RecordsTable records={paged} onEdit={record => { setEditing(record); setFormOpen(true); }} onDelete={remove} />
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </section>
            <section className="card nameservers">
              <h2>Hosted zone details</h2>
              <p className="muted">Update your domain registrar with these nameservers to delegate DNS to this hosted zone.</p>
              <div className="ns-grid">
                {zone.nameservers.map(nameserver => (
                  <code key={nameserver}>{nameserver}</code>
                ))}
              </div>
            </section>
          </>
        )
      )}
      {formOpen && <RecordForm record={editing} onClose={() => { setFormOpen(false); setEditing(undefined); }} onSave={save} />}
      {importOpen && <ImportBindModal onClose={() => setImportOpen(false)} onImport={handleImportBind} />}
    </Layout>
  );
}

