import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { productService } from "@/lib/services/productService";
import type { Product } from "@/lib/db/schema";
import { toast } from "sonner";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productService.getAll().then(setProducts);
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8">
      <PageHeader title="Produtos" action={<Button><Plus className="mr-2 h-4 w-4" />Novo</Button>} />
      <Card>
        <CardContent className="p-6">
          <Input placeholder="Buscar..." className="mb-4" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.category}</TableCell>
                  <TableCell>R$ {p.sale_price.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={p.stock_quantity <= p.min_stock ? "destructive" : "default"}>{p.stock_quantity}</Badge></TableCell>
                  <TableCell><Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
