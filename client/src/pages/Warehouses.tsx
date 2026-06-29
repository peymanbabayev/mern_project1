import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, Warehouse as WarehouseIcon, MapPin, X, CheckCircle, XCircle, ChevronLeft, ChevronRight, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { warehouseService, type CreateWarehousePayload, type Warehouse } from "@/services/warehouse/warehouse.service";

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  active: { label: "Aktiv", cls: "bg-green-500/10 text-green-600 border border-green-500/20", icon: <CheckCircle className="w-3 h-3" /> },
  inactive: { label: "Deaktiv", cls: "bg-gray-500/10 text-gray-500 border border-gray-500/20", icon: <XCircle className="w-3 h-3" /> },
};

const emptyForm: CreateWarehousePayload = { name: "", location: "", status: "active", notes: "" };

export default function Warehouses() {
  const [data, setData] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<CreateWarehousePayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Inventory modal states
  const [inventoryWarehouse, setInventoryWarehouse] = useState<Warehouse | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getAll({
        page, limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.status === "success") {
        setData(res.data.warehouses ?? []);
        setTotal(res.data.total ?? 0);
        setPages(res.data.pages ?? 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: Warehouse) => {
    setEditItem(item);
    setForm({ name: item.name, location: item.location || "", status: item.status, notes: item.notes || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editItem) { await warehouseService.update(editItem._id, form); }
      else { await warehouseService.create(form); }
      setModalOpen(false);
      fetchData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await warehouseService.delete(id); fetchData(); }
    catch (e) { console.error(e); } finally { setDeleteId(null); }
  };

  const openInventory = async (wh: Warehouse) => {
    setInventoryWarehouse(wh);
    setInventoryLoading(true);
    setInventory([]);
    try {
      const res = await warehouseService.getInventory(wh._id);
      if (res.status === "success") {
        setInventory(res.data ?? []);
      }
    } catch (e) {
      console.error("İnventar yüklənərkən xəta:", e);
    } finally {
      setInventoryLoading(false);
    }
  };

  const activeCount = data.filter(w => w.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <WarehouseIcon className="w-7 h-7 text-primary" />
            Anbarlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Anbar məkanlarını idarə edin · <span className="font-medium text-primary">{total}</span> anbar</p>
        </div>
        <Button id="btn-add-warehouse" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Yeni Anbar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Cəmi Anbar", value: total, cls: "border-primary/20 bg-primary/5", iconCls: "text-primary" },
          { label: "Aktiv", value: activeCount, cls: "border-green-500/20 bg-green-500/5", iconCls: "text-green-500" },
          { label: "Deaktiv", value: total - activeCount, cls: "border-gray-500/20 bg-gray-500/5", iconCls: "text-gray-500" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 ${s.cls}`}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.iconCls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[{ value: "all", label: "Hamısı" }, { value: "active", label: "Aktiv" }, { value: "inactive", label: "Deaktiv" }].map(f => (
          <button key={f.value} id={`filter-wh-${f.value}`} onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${statusFilter === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />Yüklənir...
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-20 text-muted-foreground">
          <WarehouseIcon className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">Anbar tapılmadı</p>
          <p className="text-sm mt-1">Yeni anbar əlavə edin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((wh) => (
            <div key={wh._id} className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className={`h-1.5 w-full ${wh.status === "active" ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gray-300"}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <WarehouseIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[wh.status]?.cls}`}>
                    {STATUS_CONFIG[wh.status]?.icon}{STATUS_CONFIG[wh.status]?.label}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 truncate">{wh.name}</h3>
                {wh.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{wh.location}
                  </p>
                )}
                {wh.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{wh.notes}</p>}
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button onClick={() => openInventory(wh)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 text-xs font-medium transition-colors">
                    <Package className="w-3.5 h-3.5" />İnventar
                  </button>
                  <button id={`edit-wh-${wh._id}`} onClick={() => openEdit(wh)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 text-primary text-xs font-medium transition-colors">
                    <Edit className="w-3.5 h-3.5" />Redaktə
                  </button>
                  <button id={`delete-wh-${wh._id}`} onClick={() => setDeleteId(wh._id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive text-xs font-medium transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border hover:bg-accent disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border hover:bg-accent disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editItem ? "Anbarı Redaktə Et" : "Yeni Anbar"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Anbar adı *</label>
                <input id="field-wh-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Məs: Mərkəzi Anbar" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Məkan / Ünvan</label>
                <input id="field-wh-location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Şəhər, küçə, bina" className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <select id="field-wh-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktiv</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Qeyd</label>
                <textarea id="field-wh-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Anbar haqqında əlavə məlumat..." className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Ləğv et</Button>
              <Button id="btn-save-wh" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? "Saxlanır..." : editItem ? "Yadda saxla" : "Əlavə et"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
              <h3 className="font-semibold text-lg mb-2">Anbarı silmək istəyirsiniz?</h3>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Xeyr</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteId)}>Bəli, sil</Button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryWarehouse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{inventoryWarehouse.name} - İnventar</h2>
                  <p className="text-xs text-muted-foreground">Məhsullar və anbar qalıqları</p>
                </div>
              </div>
              <button onClick={() => setInventoryWarehouse(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto min-h-[300px]">
              {inventoryLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                  <p>Məhsullar yüklənir...</p>
                </div>
              ) : inventory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                  <Package className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-lg">Bu anbarda məhsul yoxdur</p>
                  <p className="text-sm mt-1">Anbara daxil olan bütün məhsullar burada göstəriləcək</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Məhsul</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Qalıq (Ədəd)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {inventory.map((item) => (
                        <tr key={item.product._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                              {item.product.image ? (
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-5 h-5 opacity-50" /></div>
                              )}
                            </div>
                            <span className="font-medium text-foreground">{item.product.name}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {item.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="flex justify-end px-6 py-4 border-t shrink-0">
              <Button onClick={() => setInventoryWarehouse(null)}>Bağla</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
