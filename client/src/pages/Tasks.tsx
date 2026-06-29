import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, Inbox, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { taskService, type TaskItem } from "@/services/task/task.service";
import { warehouseService, type Warehouse } from "@/services/warehouse/warehouse.service";

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: { label: "Gözləyir", cls: "bg-orange-500/10 text-orange-600 border border-orange-500/20", icon: <Clock className="w-3 h-3" /> },
    in_progress: { label: "İcra edilir", cls: "bg-blue-500/10 text-blue-600 border border-blue-500/20", icon: <Clock className="w-3 h-3" /> },
    completed: { label: "Tamamlandı", cls: "bg-green-500/10 text-green-600 border border-green-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled: { label: "Ləğv edildi", cls: "bg-red-500/10 text-red-600 border border-red-500/20", icon: <Clock className="w-3 h-3" /> },
};

export default function Tasks() {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
    const [receivedItems, setReceivedItems] = useState<{ productId: string; actualQuantity: number }[]>([]);
    const [completing, setCompleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tasksRes, warehousesRes] = await Promise.all([
                taskService.getAll(),
                warehouseService.getAll()
            ]);
            const taskList = Array.isArray(tasksRes?.data) ? tasksRes.data : (tasksRes?.data?.data ?? []);
            const warehouseList = warehousesRes?.data?.warehouses ?? [];
            setTasks(taskList);
            setWarehouses(warehouseList);
            if (warehouseList.length > 0) {
                setSelectedWarehouseId(warehouseList[0]._id);
            }
        } catch (error) {
            console.error("Tapşırıqlar yüklənərkən xəta:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleComplete = async () => {
        if (!selectedTask) return;
        setCompleting(true);
        try {
            await taskService.complete(selectedTask._id, {
                warehouseId: selectedWarehouseId,
                receivedItems: selectedTask.type === "receive_purchase" ? receivedItems : undefined
            });
            setSelectedTask(null);
            fetchData();
        } catch (error) {
            console.error("Tapşırıq tamamlanarkən xəta:", error);
            alert("Tapşırığı tamamlamaq mümkün olmadı.");
        } finally {
            setCompleting(false);
        }
    };

    const openTaskModal = (task: TaskItem) => {
        setSelectedTask(task);
        if (task.type === "receive_purchase" && task.referenceId?.items) {
            setReceivedItems(task.referenceId.items.map(item => ({
                productId: typeof item.product === "object" ? (item.product as any)._id : item.product,
                actualQuantity: item.quantity
            })));
        } else {
            setReceivedItems([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tapşırıqlar Jurnalı</h1>
                    <p className="text-sm text-muted-foreground mt-1">Sizə təyin edilmiş bütün tapşırıqlar</p>
                </div>
            </div>

            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">Yüklənir...</div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                        <Inbox className="w-10 h-10 opacity-20" />
                        <p>Hazırda heç bir tapşırıq yoxdur</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {tasks.map((task) => (
                            <div key={task._id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="space-y-1 w-full max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{task.title}</h3>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[task.status]?.cls || ""}`}>
                                            {STATUS_CONFIG[task.status]?.icon}
                                            {STATUS_CONFIG[task.status]?.label || task.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                                    
                                    {task.referenceId?.items && task.type === "receive_purchase" && (
                                        <div className="mt-4 pt-4 border-t w-full">
                                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Box className="w-4 h-4" /> Gözlənilən Məhsullar</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {task.referenceId.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border text-sm">
                                                        <div className="w-8 h-8 rounded bg-background border flex items-center justify-center overflow-hidden shrink-0">
                                                            {item.product.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : <Box className="w-4 h-4 text-muted-foreground" />}
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <p className="font-medium truncate">{item.product.name}</p>
                                                        </div>
                                                        <div className="font-semibold px-2 py-0.5 bg-background border rounded text-xs">
                                                            {item.quantity} ədəd
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {task.status !== "completed" && task.status !== "cancelled" && (
                                    <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                                        <Button className="w-full sm:w-auto" onClick={() => openTaskModal(task)}>
                                            İcra et
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border animate-in fade-in zoom-in-95">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-2">{selectedTask.title}</h2>
                            <p className="text-muted-foreground text-sm mb-6">{selectedTask.description}</p>
                            
                            {selectedTask.type === "receive_purchase" && (
                                <>
                                    <div className="space-y-2 mb-4">
                                        <label className="text-sm font-medium">Məhsullar hansı anbara qəbul edilsin?</label>
                                        <select 
                                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={selectedWarehouseId}
                                            onChange={e => setSelectedWarehouseId(e.target.value)}
                                        >
                                            <option value="" disabled>Anbar seçin...</option>
                                            {warehouses.map(w => (
                                                <option key={w._id} value={w._id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedTask.referenceId?.items && (
                                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                            <label className="text-sm font-medium">Faktiki Qəbul (Ədəd)</label>
                                            <div className="space-y-2">
                                                {selectedTask.referenceId.items.map((item, idx) => {
                                                    const prodId = typeof item.product === "object" ? (item.product as any)._id : item.product;
                                                    const ri = receivedItems.find(r => r.productId === prodId);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border text-sm">
                                                            <div className="flex-1 truncate">
                                                                <p className="font-medium truncate">{typeof item.product === "object" ? (item.product as any).name : "Məhsul"}</p>
                                                                <p className="text-xs text-muted-foreground">Sifariş: {item.quantity}</p>
                                                            </div>
                                                            <div className="w-24 shrink-0">
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    value={ri?.actualQuantity ?? item.quantity}
                                                                    onChange={e => {
                                                                        const val = Number(e.target.value);
                                                                        setReceivedItems(prev => prev.map(p => 
                                                                            p.productId === prodId ? { ...p, actualQuantity: val } : p
                                                                        ));
                                                                    }}
                                                                    className="w-full px-2 py-1.5 rounded border text-sm text-center focus:outline-none bg-background"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedTask(null)}>Ləğv et</Button>
                                <Button onClick={handleComplete} disabled={completing || (selectedTask.type === "receive_purchase" && !selectedWarehouseId)}>
                                    {completing ? "Gözləyin..." : "Təsdiqlə və Tamamla"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
