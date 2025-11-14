import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cashRegisterService } from "@/lib/services/cashRegisterService";
import type { CashRegister } from "@/lib/db/schema";

export default function CashManagement() {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);

  useEffect(() => {
    loadCashRegisters();
  }, []);

  const loadCashRegisters = async () => {
    const registers = await cashRegisterService.getAll();
    setCashRegisters(registers);
  };

  const openCashRegisters = cashRegisters.filter(r => r.status === 'open');
  const totalInCash = openCashRegisters.reduce((sum, r) => sum + r.opening_balance, 0);
  return (
    <div className="flex-1 p-8">
      <PageHeader
        title="Gestão de Caixa"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Abrir Caixa
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caixas Abertos</p>
                <p className="text-2xl font-bold">{openCashRegisters.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total em Caixas</p>
                <p className="text-2xl font-bold">{totalInCash.toFixed(2)} Kz</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transações Hoje</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operador</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead>Valor Inicial</TableHead>
                  <TableHead>Valor Final</TableHead>
                  <TableHead>Transações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum caixa registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  cashRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell className="font-medium">{register.user_id}</TableCell>
                      <TableCell>{new Date(register.opening_date).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        {register.closing_date ? new Date(register.closing_date).toLocaleString('pt-BR') : "-"}
                      </TableCell>
                      <TableCell>{register.opening_balance.toFixed(2)} Kz</TableCell>
                      <TableCell>
                        {register.closing_balance !== undefined 
                          ? `${register.closing_balance.toFixed(2)} Kz` 
                          : `${register.opening_balance.toFixed(2)} Kz`}
                      </TableCell>
                      <TableCell>{register.total_sales.toFixed(2)} Kz</TableCell>
                      <TableCell>
                        <Badge variant={register.status === "open" ? "default" : "secondary"}>
                          {register.status === "open" ? "Aberto" : "Fechado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {register.status === "open" ? (
                          <Button variant="outline" size="sm">
                            Fechar Caixa
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        )}
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
