import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Edit, Users, Building2, UserCheck, Filter, ChevronLeft, ChevronRight, X, Phone, Mail, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { kontragentService, type CreateKontragentPayload, type Kontragent } from "@/services/kontragent/kontragent.service";

const KONTRAGENT_TYPES = [
  { value: "all", label: "Hamısı" },
  { value: "customer", label: "Müştəri" },
  { value: "supplier", label: "Təchizatçı" },
  { value: "both", label: "Hər ikisi" },
];

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  customer: { label: "Müştəri", cls: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
  supplier: { label: "Təchizatçı", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  both: { label: "Hər ikisi", cls: "bg-purple-500/10 text-purple-600 border border-purple-500/20" },
};

const emptyForm: CreateKontragentPayload = {
  name: "", type: "customer", contactPerson: "", phone: "", email: "", address: "", taxId: "", notes: "",
};

export default function Kontragents() {
  const [data, setData] = useState<Kontragent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kontragent | null>(null);
  const [form, setForm] = useState<CreateKontragentPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kontragentService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      if (res.status === "success") {
        setData(res.data.kontragents ?? []);
        setTotal(res.data.total ?? 0);
        setPages(res.data.pages ?? 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: Kontragent) => { setEditItem(item); setForm({ name: item.name, type: item.type, contactPerson: item.contactPerson || "", phone: item.phone || "", email: item.email || "", address: item.address || "", taxId: item.taxId || "", notes: item.notes || "" }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        await kontragentService.update(editItem._id, form);
      } else {
        await kontragentService.create(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await kontragentService.delete(id);
      fetchData();
    } catch (e) { console.error(e); } finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Kontragentlər
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Müştəri və təchizatçıları idarə edin · <span className="font-medium text-primary">{total}</span> qeyd</p>
        </div>
        <Button id="btn-add-kontragent" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Yeni Kontragent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="search-kontragent" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Ad, email, telefon axtarın..." className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <Button type="submit" variant="outline" size="sm" className="gap-1"><Filter className="w-3 h-3" />Axtar</Button>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {KONTRAGENT_TYPES.map(t => (
            <button key={t.value} id={`filter-${t.value}`} onClick={() => { setTypeFilter(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${typeFilter === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Yüklənir...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Building2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Kontragent tapılmadı</p>
            <p className="text-sm mt-1">Yeni kontragent əlavə edin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ad</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Əlaqə</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">VÖEN</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Növ</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{item.name}</div>
                      {item.contactPerson && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><UserCheck className="w-3 h-3" />{item.contactPerson}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {item.phone && <div className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{item.phone}</div>}
                      {item.email && <div className="flex items-center gap-1 text-xs mt-0.5"><Mail className="w-3 h-3" />{item.email}</div>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {item.taxId ? <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{item.taxId}</span> : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[item.type]?.cls}`}>
                        {TYPE_BADGE[item.type]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button id={`edit-${item._id}`} onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        <button id={`delete-${item._id}`} onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">{total} nəticədən {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} göstərilir</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-3 py-1.5 text-xs font-medium">{page}/{pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editItem ? "Kontragenti Redaktə Et" : "Yeni Kontragent"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ad *</label>
                <input id="field-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Şirkət adı" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Növ *</label>
                <select id="field-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="customer">Müştəri</option>
                  <option value="supplier">Təchizatçı</option>
                  <option value="both">Hər ikisi</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Əlaqədar şəxs</label>
                <input id="field-contact" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Ad Soyad" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon</label>
                <input id="field-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+994 XX XXX XX XX" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input id="field-email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="email@nümunə.az" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">VÖEN</label>
                <input id="field-taxid" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} placeholder="Vergi ödəyicisi eyniləşdirmə nömrəsi" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ünvan</label>
                <input id="field-address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Şəhər, küçə, bina" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Qeyd</label>
                <textarea id="field-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Əlavə qeydlər..." className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <Button id="btn-cancel" variant="outline" onClick={() => setModalOpen(false)}>Ləğv et</Button>
              <Button id="btn-save" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? "Saxlanır..." : editItem ? "Dəyişiklikləri saxla" : "Əlavə et"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Silmək istəyirsiniz?</h3>
              <p className="text-sm text-muted-foreground">Bu əməliyyat geri alına bilməz.</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <Button id="btn-cancel-delete" variant="outline" onClick={() => setDeleteId(null)}>Xeyr</Button>
              <Button id="btn-confirm-delete" variant="destructive" onClick={() => handleDelete(deleteId)}>Bəli, sil</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
