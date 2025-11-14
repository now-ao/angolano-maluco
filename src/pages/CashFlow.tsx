import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { accountService } from "@/lib/services/accountService";
import type { Account } from "@/lib/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CashFlow() {
  const [receivables, setReceivables] = useState<Account[]>([]);
  const [payables, setPayables] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const [receivablesList, payablesList] = await Promise.all([
        accountService.getReceivables(),
        accountService.getPayables(),
      ]);
      setReceivables(receivablesList);
      setPayables(payablesList);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingReceivables = receivables.filter(a => a.status === 'pending' || a.status === 'overdue');
  const pendingPayables = payables.filter(a => a.status === 'pending' || a.status === 'overdue');
  
  const totalReceivable = pendingReceivables.reduce((sum, acc) => sum + acc.amount, 0);
  const totalPayable = pendingPayables.reduce((sum, acc) => sum + acc.amount, 0);
  const balance = totalReceivable - totalPayable;

  const overdueReceivables = receivables.filter(a => a.status === 'overdue');
  const overduePayables = payables.filter(a => a.status === 'overdue');

  const getStatusBadge = (status: Account['status']) => {
    const variants: Record<Account['status'], "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      paid: "default",
      overdue: "destructive",
      cancelled: "secondary",
    };
    const labels: Record<Account['status'], string> = {
      pending: "Pendente",
      paid: "Pago",
      overdue: "Vencido",
      cancelled: "Cancelado",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <PageHeader title="Fluxo de Caixa" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <PageHeader title="Fluxo de Caixa" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-success">{totalReceivable.toFixed(2)} Kz</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingReceivables.length} título(s)
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Pagar</p>
                <p className="text-2xl font-bold text-destructive">{totalPayable.toFixed(2)} Kz</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingPayables.length} título(s)
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Projetado</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {balance.toFixed(2)} Kz
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receber - Pagar
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Títulos Vencidos</p>
                <p className="text-2xl font-bold text-warning">
                  {overdueReceivables.length + overduePayables.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overdueReceivables.length} receber / {overduePayables.length} pagar
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
          <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="overdue">Vencidos</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma conta a receber registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      receivables.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.description}</TableCell>
                          <TableCell>{formatDate(account.due_date)}</TableCell>
                          <TableCell className="font-semibold">{account.amount.toFixed(2)} Kz</TableCell>
                          <TableCell>{getStatusBadge(account.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Ver detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma conta a pagar registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      payables.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.description}</TableCell>
                          <TableCell>{formatDate(account.due_date)}</TableCell>
                          <TableCell className="font-semibold">{account.amount.toFixed(2)} Kz</TableCell>
                          <TableCell>{getStatusBadge(account.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Ver detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Títulos Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueReceivables.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-success" />
                      Recebimentos Vencidos
                    </h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueReceivables.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.description}</TableCell>
                              <TableCell>{formatDate(account.due_date)}</TableCell>
                              <TableCell className="font-semibold">{account.amount.toFixed(2)} Kz</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Ver detalhes</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {overduePayables.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-destructive" />
                      Pagamentos Vencidos
                    </h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overduePayables.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.description}</TableCell>
                              <TableCell>{formatDate(account.due_date)}</TableCell>
                              <TableCell className="font-semibold">{account.amount.toFixed(2)} Kz</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Ver detalhes</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {overdueReceivables.length === 0 && overduePayables.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum título vencido
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
