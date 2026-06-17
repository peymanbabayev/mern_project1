import { useState, useEffect } from "react";
import { adminService } from "../services/api/admin.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import type { User } from "@/services/auth/auth.service";

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingUsers();
            if (response.status === "success") {
                setUsers(response.data);
            }
        } catch (err: any) {
            setError(err.message || "İstifadəçiləri yükləyərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleUpdateStatus = async (userId: string, status: "approved" | "rejected") => {
        try {
            setError("");
            setMessage("");
            const response = await adminService.updateUserStatus(userId, status);
            if (response.status === "success") {
                setMessage(`İstifadəçi statusu '${status}' olaraq dəyişdirildi.`);
                // Update local state to remove user
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (err: any) {
            setError(err.message || "Status yenilənərkən xəta baş verdi");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Admin Paneli - Təsdiq Gözləyən İstifadəçilər</h1>
            
            {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-100">{error}</div>}
            {message && <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md border border-green-100">{message}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>Gözləmədə Olanlar</CardTitle>
                    <CardDescription>Sistemə qoşulmaq üçün admin təsdiqi gözləyən istifadəçilərin siyahısı</CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Təsdiq gözləyən istifadəçi yoxdur.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-md">Ad Soyad</th>
                                        <th className="px-4 py-3">İstifadəçi Adı</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3 text-right rounded-tr-md">Əməliyyat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                                            <td className="px-4 py-3 text-foreground">{user.username}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                                    onClick={() => handleUpdateStatus(user._id, "approved")}
                                                >
                                                    Təsdiqlə
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                                    onClick={() => handleUpdateStatus(user._id, "rejected")}
                                                >
                                                    Rədd Et
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
