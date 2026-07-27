import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import HostedZoneTable from "../components/HostedZoneTable";
import { DeleteZoneModal, ZoneForm } from "../components/Modals";
import Pagination from "../components/Pagination";
import { useToast } from "../components/Notifications";
import { api, Zone } from "../lib/api";

const PAGE_SIZE = 10;

export default function HostedZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [formZone, setFormZone] = useState<Zone | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const refresh = () =>
    api<Zone[]>("/api/hosted-zones")
      .then(setZones)
      .catch(error => notify(error.message, "error"))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      zones.filter(
        zone =>
          zone.domain_name.includes(query.toLowerCase()) &&
          (type === "all" || (type === "private" ? zone.is_private : !zone.is_private))
      ),
    [zones, query, type]
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, type]);

  const save = async (data: { domain_name: string; description: string; is_private: boolean }) => {
    if (formZone) {
      await api<Zone>(`/api/hosted-zones/${formZone.id}`, {
        method: "PUT",
        body: JSON.stringify({ description: data.description, is_private: data.is_private }),
      });
      notify("Hosted zone updated.");
    } else {
      await api<Zone>("/api/hosted-zones", { method: "POST", body: JSON.stringify(data) });
      notify("Hosted zone created.");
    }
    setFormOpen(false);
    setFormZone(undefined);
    refresh();
  };

  const remove = async (zone: Zone) => {
    try {
      await api(`/api/hosted-zones/${zone.id}`, { method: "DELETE" });
      notify(`Hosted zone ${zone.domain_name} deleted.`);
      setDeletingZone(null);
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete hosted zone.", "error");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <span className="eyebrow">DNS MANAGEMENT</span>
          <h1>Hosted zones</h1>
          <p>Create and manage DNS zones for your domains.</p>
        </div>
        <button
          onClick={() => {
            setFormZone(undefined);
            setFormOpen(true);
          }}
        >
          Create hosted zone
        </button>
      </div>
      <section className="card">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Find hosted zone by domain name"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <select className="filter" value={type} onChange={event => setType(event.target.value)}>
            <option value="all">All zone types</option>
            <option value="public">Public hosted zones</option>
            <option value="private">Private hosted zones</option>
          </select>
        </div>
        {loading ? (
          <div className="loading">Loading hosted zones...</div>
        ) : (
          <>
            <HostedZoneTable
              zones={paged}
              onEdit={zone => {
                setFormZone(zone);
                setFormOpen(true);
              }}
              onDelete={zone => setDeletingZone(zone)}
            />
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </section>
      {formOpen && (
        <ZoneForm
          zone={formZone}
          onClose={() => {
            setFormOpen(false);
            setFormZone(undefined);
          }}
          onSave={save}
        />
      )}
      {deletingZone && (
        <DeleteZoneModal
          zone={deletingZone}
          onClose={() => setDeletingZone(null)}
          onConfirm={() => remove(deletingZone)}
        />
      )}
    </Layout>
  );
}
