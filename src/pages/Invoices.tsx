import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Sale {
  id: string;
  operatorName: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  status: string;
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    numerario: 'Numerário',
    tpa: 'TPA',
    transferencia: 'Transferência Bancária',
    multicaixa: 'Multicaixa Express',
  };
  return labels[method] || method;
};

export default function Invoices() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const loadSales = () => {
      const saved = localStorage.getItem('sales');
      if (saved) {
        setSales(JSON.parse(saved));
      }
    };
    loadSales();
  }, []);

  const deleteSale = (id: string) => {
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    localStorage.setItem('sales', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 p-8">
      <PageHeader title="Faturas e Recibos" />

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhuma venda registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">{sale.id}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>{sale.time}</TableCell>
                          <TableCell>{sale.operatorName}</TableCell>
                          <TableCell>{sale.items.length} item(s)</TableCell>
                          <TableCell className="font-semibold">{sale.total.toFixed(2)} Kz</TableCell>
                          <TableCell>{getPaymentMethodLabel(sale.paymentMethod)}</TableCell>
                          <TableCell>
                            <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                              {sale.status === 'completed' ? 'Concluída' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteSale(sale.id)}
                              >
                                <Trash2 className="h-3 w-3" />
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
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Modelos de Documentos</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Modelo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Modelo Padrão</h3>
                    <p className="text-sm text-muted-foreground mb-1">Tipo: Fatura</p>
                    <p className="text-sm text-muted-foreground mb-4">Tamanho: A4</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Usar Modelo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
