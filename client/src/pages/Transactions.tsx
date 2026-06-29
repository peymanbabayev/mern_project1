import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, ArrowRightLeft, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp, RefreshCcw, Tag, ArrowLeft, Box, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionService, type CreateTransactionPayload, type Transaction } from "@/services/transaction/transaction.service";
import { kontragentService, type Kontragent } from "@/services/kontragent/kontragent.service";
import { productService, type Product } from "@/services/products/product.service";

const TRANSACTION_TYPES = [
  { value: "all", label: "Hamısı" },
  { value: "sale", label: "Satış" },
  { value: "purchase", label: "Alış" },
  { value: "refund_sale", label: "Satış qaytarma" },
  { value: "refund_purchase", label: "Alış qaytarma" },
];

const STATUS_TYPES = [
  { value: "all", label: "Hamısı" },
  { value: "draft", label: "Qaralama" },
  { value: "pending_receipt", label: "İcra gözləyir" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "Ləğv edildi" },
];

const TYPE_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  sale: { label: "Satış", cls: "bg-green-500/10 text-green-600 border border-green-500/20", icon: <TrendingUp className="w-3 h-3" /> },
  purchase: { label: "Alış", cls: "bg-blue-500/10 text-blue-600 border border-blue-500/20", icon: <ShoppingCart className="w-3 h-3" /> },
  refund_sale: { label: "Satış q.", cls: "bg-orange-500/10 text-orange-600 border border-orange-500/20", icon: <RefreshCcw className="w-3 h-3" /> },
  refund_purchase: { label: "Alış q.", cls: "bg-red-500/10 text-red-600 border border-red-500/20", icon: <RefreshCcw className="w-3 h-3" /> },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft: { label: "Qaralama", cls: "bg-gray-500/10 text-gray-600 border border-gray-500/20" },
  pending_receipt: { label: "İcra gözləyir", cls: "bg-orange-500/10 text-orange-600 border border-orange-500/20" },
  completed: { label: "Tamamlandı", cls: "bg-green-500/10 text-green-600 border border-green-500/20" },
  cancelled: { label: "Ləğv edildi", cls: "bg-red-500/10 text-red-600 border border-red-500/20" },
};

const PAYMENT_CONFIG: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "Ödənilməyib", cls: "bg-red-500/10 text-red-600" },
  partial: { label: "Qismən", cls: "bg-amber-500/10 text-amber-600" },
  paid: { label: "Ödənilib", cls: "bg-green-500/10 text-green-600" },
};

export default function Transactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [view, setView] = useState<"list" | "form">("list");
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const [kontragents, setKontragents] = useState<Kontragent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Omit<CreateTransactionPayload, "items"> & { items: { product: string; quantity: number; unitPrice: number }[], notes: string }>({
    type: "purchase", kontragent: "", items: [], status: "draft", paymentStatus: "unpaid", notes: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll({
        page, limit: 10,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.status === "success") {
        setData(res.data.transactions ?? []);
        setTotal(res.data.total ?? 0);
        setPages(res.data.pages ?? 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, typeFilter, statusFilter]);

  const fetchKontragents = useCallback(async () => {
    try {
      const res = await kontragentService.getAll({ limit: 100 });
      if (res.status === "success") setKontragents(res.data.kontragents ?? []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productService.getAll();
      if (res.status === "success") {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchKontragents(); }, [fetchKontragents]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ type: "purchase", kontragent: "", items: [{ product: "", quantity: 1, unitPrice: 0 }], status: "draft", paymentStatus: "unpaid", notes: "" });
    setView("form");
  };
  const openEdit = (item: Transaction) => {
    setEditItem(item);
    const kId = typeof item.kontragent === "object" ? item.kontragent._id : item.kontragent;
    const mappedItems = item.items.map(i => ({
      product: typeof i.product === "object" ? (i.product as any)._id : i.product,
      quantity: i.quantity,
      unitPrice: i.unitPrice
    }));
    setForm({ type: item.type, kontragent: kId, items: mappedItems.length ? mappedItems : [{ product: "", quantity: 1, unitPrice: 0 }], status: item.status, paymentStatus: item.paymentStatus, notes: item.notes || "" });
    setView("form");
  };

  const handleSave = async () => {
    if (!form.kontragent) return;
    const validItems = form.items.filter(i => i.product);
    setSaving(true);
    try {
      if (editItem) {
        await transactionService.update(editItem._id, { type: form.type, kontragent: form.kontragent, items: validItems, status: form.status, paymentStatus: form.paymentStatus, notes: form.notes });
      } else {
        await transactionService.create({ type: form.type, kontragent: form.kontragent, items: validItems, status: form.status, paymentStatus: form.paymentStatus, notes: form.notes });
      }
      setView("list");
      fetchData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await transactionService.delete(id); fetchData(); }
    catch (e) { console.error(e); } finally { setDeleteId(null); }
  };

  const getKontragentName = (k: Transaction["kontragent"]) => typeof k === "object" ? k.name : kontragents.find(c => c._id === k)?.name || "—";

  if (view === "form") {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("list")} className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{editItem ? "Qaiməni Redaktə Et" : "Yeni Qaimə"}</h1>
              <p className="text-sm text-muted-foreground mt-1">Məlumatları daxil edərək qaiməni yadda saxlayın.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl h-11 px-6" onClick={() => setView("list")}>Ləğv et</Button>
            <Button onClick={handleSave} disabled={saving || !form.kontragent} className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 shadow-md hover:shadow-lg transition-all">
              <Check className="w-4 h-4" />
              {saving ? "Saxlanır..." : "Yadda saxla"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol panel - Əsas məlumatlar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-5 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Əsas Məlumatlar</h3>
                  <p className="text-xs text-muted-foreground">Qaimə barədə ümumi məlumatlar</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Qaimə növü <span className="text-destructive">*</span></label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-4 py-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                    <option value="sale">Satış</option>
                    <option value="purchase">Alış</option>
                    <option value="refund_sale">Satış Qaytarma</option>
                    <option value="refund_purchase">Alış Qaytarma</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kontragent <span className="text-destructive">*</span></label>
                  <select value={form.kontragent} onChange={e => setForm(f => ({ ...f, kontragent: e.target.value }))} className="w-full px-4 py-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                    <option value="">Seçin...</option>
                    {kontragents.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-4 py-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                      <option value="draft">Qaralama</option>
                      <option value="pending_receipt">İcra gözləyir</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="cancelled">Ləğv edildi</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Ödəniş</label>
                    <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value as any }))} className="w-full px-4 py-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
                      <option value="unpaid">Ödənilməyib</option>
                      <option value="partial">Qismən</option>
                      <option value="paid">Ödənilib</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Əlavə Qeyd</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} className="w-full px-4 py-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Qaimə barədə qeydlər daxil edin..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ panel - Məhsullar */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card border rounded-3xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between p-6 bg-muted/5 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Box className="w-6 h-6"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Məhsullar</h3>
                    <p className="text-sm text-muted-foreground">Qaiməyə daxil olan məhsulların siyahısı</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setForm(f => ({ ...f, items: [...f.items, { product: "", quantity: 1, unitPrice: 0 }] }))} className="gap-2 rounded-xl h-10 shadow-sm hover:shadow transition-all bg-background border hover:bg-muted">
                  <Plus className="w-4 h-4" /> Yeni sətir
                </Button>
              </div>

              <div className="p-6 flex-1">
                {form.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed">
                    <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-5 shadow-sm border">
                      <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-foreground text-lg">Məhsul əlavə edilməyib</p>
                    <p className="text-sm mt-1">Siyahıya yeni məhsul əlavə etmək üçün "Yeni sətir" düyməsini basın.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Headers for desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-5 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-5">Məhsul Adı</div>
                      <div className="col-span-2">Say</div>
                      <div className="col-span-3">Vahid Qiyməti (₼)</div>
                      <div className="col-span-2 text-right pr-2">Cəmi</div>
                    </div>

                    <div className="space-y-3">
                      {form.items.map((item, idx) => (
                        <div key={idx} className="group flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center bg-background border border-border/50 p-3 sm:p-2 sm:pl-3 rounded-2xl transition-all hover:shadow-md hover:border-primary/30 relative">
                          
                          <div className="w-full sm:col-span-5">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block sm:hidden">Məhsul</label>
                            <select value={item.product} onChange={e => {
                              const newItems = [...form.items];
                              newItems[idx].product = e.target.value;
                              setForm(f => ({ ...f, items: newItems }));
                            }} className="w-full px-4 py-2.5 rounded-xl border-transparent bg-muted/30 hover:bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors cursor-pointer appearance-none">
                              <option value="">Məhsul seçin...</option>
                              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                          </div>

                          <div className="w-full sm:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block sm:hidden">Say</label>
                            <input type="number" value={item.quantity || ""} min="1" onChange={e => {
                              const newItems = [...form.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setForm(f => ({ ...f, items: newItems }));
                            }} className="w-full px-4 py-2.5 rounded-xl border-transparent bg-muted/30 hover:bg-muted/50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" placeholder="0" />
                          </div>

                          <div className="w-full sm:col-span-3">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block sm:hidden">Vahid Qiyməti</label>
                            <div className="relative">
                              <input type="number" value={item.unitPrice || ""} min="0" step="0.01" onChange={e => {
                                const newItems = [...form.items];
                                newItems[idx].unitPrice = Number(e.target.value);
                                setForm(f => ({ ...f, items: newItems }));
                              }} className="w-full pl-4 pr-8 py-2.5 rounded-xl border-transparent bg-muted/30 hover:bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" placeholder="0.00" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₼</span>
                            </div>
                          </div>

                          <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-4 border-t sm:pt-0 sm:border-t-0 mt-2 sm:mt-0 pr-2">
                            <span className="sm:hidden text-sm font-medium text-muted-foreground">Sətir cəmi:</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-foreground text-sm whitespace-nowrap">
                                {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString("az-AZ", { minimumFractionDigits: 2 })} ₼
                              </span>
                              <button onClick={() => {
                                const newItems = form.items.filter((_, i) => i !== idx);
                                setForm(f => ({ ...f, items: newItems }));
                              }} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0" title="Sil">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Yekun məbləğ */}
              {form.items.length > 0 && (
                <div className="bg-primary/5 p-6 border-t mt-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-primary/70 text-sm font-medium hidden sm:block">Zəhmət olmasa məlumatların doğruluğunu yoxlayın.</p>
                    <div className="flex items-center gap-5 bg-background px-8 py-5 rounded-3xl border border-primary/20 shadow-sm w-full sm:w-auto justify-between sm:justify-start transform transition-transform hover:scale-[1.02]">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Yekun məbləğ</span>
                        <span className="text-3xl font-extrabold text-primary flex items-baseline gap-1">
                          {form.items.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unitPrice || 0)), 0).toLocaleString("az-AZ", { minimumFractionDigits: 2 })}
                          <span className="text-xl font-bold">₼</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-7 h-7 text-primary" />
            Qaimələr
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Satış və alış qaimələrini idarə edin · <span className="font-medium text-primary">{total}</span> qeyd</p>
        </div>
        <Button id="btn-add-transaction" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Yeni Qaimə
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Satış", icon: <TrendingUp className="w-4 h-4 text-green-500" />, filter: "sale", cls: "border-green-500/20 bg-green-500/5" },
          { label: "Alış", icon: <ShoppingCart className="w-4 h-4 text-blue-500" />, filter: "purchase", cls: "border-blue-500/20 bg-blue-500/5" },
          { label: "Tamamlanmış", icon: <Tag className="w-4 h-4 text-purple-500" />, filter: "", cls: "border-purple-500/20 bg-purple-500/5" },
          { label: "Cəmi", icon: <ArrowRightLeft className="w-4 h-4 text-primary" />, filter: "all", cls: "border-primary/20 bg-primary/5" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 ${s.cls}`}>
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs font-medium text-muted-foreground">{s.label}</span></div>
            <div className="text-2xl font-bold">{i === 3 ? total : data.filter(d => s.filter ? d.type === s.filter : d.status === "completed").length}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TRANSACTION_TYPES.map(t => (
            <button key={t.value} id={`filter-type-${t.value}`} onClick={() => { setTypeFilter(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${typeFilter === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TYPES.map(s => (
            <button key={s.value} id={`filter-status-${s.value}`} onClick={() => { setStatusFilter(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${statusFilter === s.value ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background border-border text-muted-foreground hover:border-secondary/50"}`}>
              {s.label}
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
            <ArrowRightLeft className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Qaimə tapılmadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Kontragent</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Növ</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Məbləğ</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Ödəniş</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 font-medium">{getKontragentName(item.kontragent)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TYPE_CONFIG[item.type]?.cls}`}>
                        {TYPE_CONFIG[item.type]?.icon}{TYPE_CONFIG[item.type]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-semibold">{item.totalAmount.toLocaleString("az-AZ")} ₼</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[item.status]?.cls}`}>{STATUS_CONFIG[item.status]?.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_CONFIG[item.paymentStatus]?.cls}`}>{PAYMENT_CONFIG[item.paymentStatus]?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button id={`edit-tx-${item._id}`} onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        <button id={`delete-tx-${item._id}`} onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">{total} nəticə</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border hover:bg-accent disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-3 py-1.5 text-xs font-medium">{page}/{pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border hover:bg-accent disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
              <h3 className="font-semibold text-lg mb-2">Qaiməni silmək istəyirsiniz?</h3>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Xeyr</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteId)}>Bəli, sil</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
