import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Edit, Trash2, Monitor, Smartphone, Tablet, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { resetAllData, getDataCounts } from "@/lib/utils/resetData";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  isActive: boolean;
}

interface Device {
  id: string;
  name: string;
  type: 'pos' | 'computer' | 'tablet';
  status: 'active' | 'inactive';
  lastSync: string;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'BAI',
    accountNumber: '123456789',
    iban: 'AO06 0000 0000 1234 5678 9',
    isActive: true,
  },
];

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Caixa Principal',
    type: 'pos',
    status: 'active',
    lastSync: '2024-01-15 10:30',
  },
];

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'pos':
      return <Monitor className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <Smartphone className="h-4 w-4" />;
  }
};

export default function Settings() {
  const [bankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [devices] = useState<Device[]>(mockDevices);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const counts = await getDataCounts();
      console.log('Current data counts:', counts);
      
      const success = await resetAllData();
      if (success) {
        toast.success('Dados limpos com sucesso!', {
          description: 'Todos os dados foram removidos exceto os usuários.',
        });
      } else {
        toast.error('Erro ao limpar dados', {
          description: 'Ocorreu um erro ao tentar limpar os dados.',
        });
      }
    } catch (error) {
      toast.error('Erro ao limpar dados', {
        description: 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <PageHeader title="Configurações" />

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="banks">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" defaultValue="Minha Empresa" />
                  </div>
                  <div>
                    <Label htmlFor="nif">NIF</Label>
                    <Input id="nif" placeholder="000000000" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="+244 900 000 000" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Input id="currency" defaultValue="Kz" disabled />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
                    <Input id="taxRate" type="number" defaultValue="0" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-destructive mb-1">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground">
                      Limpar todos os dados do sistema (produtos, clientes, vendas, etc.). Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isResetting}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {isResetting ? 'Limpando...' : 'Limpar Todos os Dados'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá remover permanentemente todos os dados do sistema:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Produtos</li>
                            <li>Clientes</li>
                            <li>Vendas e Faturas</li>
                            <li>Caixas e Transações</li>
                            <li>Contas a Receber/Pagar</li>
                            <li>Movimentos de Estoque</li>
                          </ul>
                          <p className="mt-2 font-semibold">Os usuários serão mantidos.</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                          Sim, limpar tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contas Bancárias</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Conta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banco</TableHead>
                      <TableHead>Número da Conta</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma conta bancária cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      bankAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-semibold">{account.bankName}</TableCell>
                          <TableCell>{account.accountNumber}</TableCell>
                          <TableCell className="font-mono text-sm">{account.iban}</TableCell>
                          <TableCell>
                            <Badge variant={account.isActive ? 'default' : 'secondary'}>
                              {account.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
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

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestão de Dispositivos</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dispositivo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Sincronização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum dispositivo cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(device.type)}
                              {device.name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{device.type === 'pos' ? 'POS' : device.type}</TableCell>
                          <TableCell>
                            <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                              {device.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{device.lastSync}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
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
      </Tabs>
    </div>
  );
}
