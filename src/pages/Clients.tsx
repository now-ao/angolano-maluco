import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { clientService } from "@/lib/services/clientService";
import type { Client as DBClient } from "@/lib/db/schema";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  status: "active" | "inactive";
  lastPurchase?: string;
  totalSpent: number;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const dbClients = await clientService.getAll();
    const mappedClients: Client[] = dbClients
      .filter(c => c.active)
      .map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        document: c.document,
        address: c.address || '',
        city: c.city || '',
        status: c.active ? 'active' : 'inactive',
        totalSpent: 0, // Will be calculated from sales
      }));
    setClients(mappedClients);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.document.includes(searchTerm)
  );

  const handleAddClient = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá adicionar novos clientes.",
    });
  };
  return (
    <div className="flex-1 p-8">
      <PageHeader
        title="CRM - Gestão de Clientes"
        action={
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Faturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou documento..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.document}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {client.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.status === "active" ? "default" : "secondary"}>
                          {client.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.lastPurchase || "-"}</TableCell>
                      <TableCell>R$ {client.totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={isDialogOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setSelectedClient(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedClient(client)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Cliente</DialogTitle>
                                <DialogDescription>
                                  Informações completas e histórico de compras
                                </DialogDescription>
                              </DialogHeader>
                              {selectedClient && (
                                <Tabs defaultValue="info" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Informações</TabsTrigger>
                                    <TabsTrigger value="history">Histórico</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="info" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Nome</Label>
                                        <p className="font-medium">{selectedClient.name}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div>
                                          <Badge variant={selectedClient.status === "active" ? "default" : "secondary"}>
                                            {selectedClient.status === "active" ? "Ativo" : "Inativo"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p>{selectedClient.email}</p>
                                      </div>
                                      <div>
                                        <Label>Telefone</Label>
                                        <p>{selectedClient.phone}</p>
                                      </div>
                                      <div>
                                        <Label>CPF/CNPJ</Label>
                                        <p>{selectedClient.document}</p>
                                      </div>
                                      <div>
                                        <Label>Cidade</Label>
                                        <p>{selectedClient.city}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label>Endereço</Label>
                                        <p>{selectedClient.address}</p>
                                      </div>
                                      <div>
                                        <Label>Total Gasto</Label>
                                        <p className="text-lg font-bold">R$ {selectedClient.totalSpent.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <Label>Última Compra</Label>
                                        <p>{selectedClient.lastPurchase || "-"}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="history">
                                    <div className="text-center py-8 text-muted-foreground">
                                      <p>Histórico de compras será exibido aqui</p>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
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
