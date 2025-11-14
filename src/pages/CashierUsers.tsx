import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { db, STORES } from "@/lib/db/indexedDB";
import type { User } from "@/lib/db/schema";

export default function CashierUsers() {
  const { isAdmin } = useAuth();
  const [cashiers, setCashiers] = useState<User[]>([]);

  useEffect(() => {
    loadCashiers();
  }, []);

  const loadCashiers = async () => {
    const users = await db.getAll<User>(STORES.USERS);
    const cashierUsers = users.filter(u => u.role === 'cashier' && u.active);
    setCashiers(cashierUsers);
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddCashier = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá adicionar novos caixistas.",
    });
  };

  return (
    <div className="flex-1 p-8">
      <PageHeader
        title="Gestão de Caixistas"
        action={
          <Button onClick={handleAddCashier}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Caixista
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Caixistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum caixista cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  cashiers.map((cashier) => (
                    <TableRow key={cashier.id}>
                      <TableCell className="font-medium">{cashier.name}</TableCell>
                      <TableCell>{cashier.email}</TableCell>
                      <TableCell>
                        <Badge variant={cashier.active ? "default" : "secondary"}>
                          {cashier.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(cashier.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
