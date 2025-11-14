import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, ScanBarcode, Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { productService } from "@/lib/services/productService";
import type { Product as DBProduct } from "@/lib/db/schema";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  barcode?: string;
}

interface Product extends Omit<CartItem, 'quantity'> {
  barcode: string;
}


const getSavedSales = (): any[] => {
  const saved = localStorage.getItem('sales');
  return saved ? JSON.parse(saved) : [];
};

const saveSale = (sale: any) => {
  const sales = getSavedSales();
  sales.push(sale);
  localStorage.setItem('sales', JSON.stringify(sales));
};

export default function Sales() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const dbProducts = await productService.getAll();
    const mappedProducts: Product[] = dbProducts
      .filter(p => p.active)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.sale_price,
        stock: p.stock_quantity,
        barcode: p.barcode || '',
      }));
    setProducts(mappedProducts);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
        toast({
          title: "Produto adicionado",
          description: `${product.name} adicionado ao carrinho`,
        });
      } else {
        toast({
          title: "Estoque insuficiente",
          description: `Não há estoque suficiente de ${product.name}`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast({
        title: "Produto adicionado",
        description: `${product.name} adicionado ao carrinho`,
      });
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (newQuantity > item.stock) {
      toast({
        title: "Estoque insuficiente",
        description: `Máximo disponível: ${item.stock}`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      toast({
        title: "Código escaneado!",
        description: `${product.name} - ${product.price.toFixed(2)} Kz`,
      });
    } else {
      toast({
        title: "Produto não encontrado",
        description: `Código: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  useBarcodeScanner({
    onScan: handleBarcodeScan,
    minLength: 8,
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0;
  const total = subtotal + tax - discount;

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    const now = new Date();
    const sale = {
      id: `SALE-${Date.now()}`,
      operatorName: user?.name || 'Operador',
      operatorId: user?.id || '0',
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: 'numerario',
      status: 'completed',
    };

    saveSale(sale);
    setCart([]);
    setDiscount(0);
    
    toast({
      title: "Venda finalizada!",
      description: `Fatura ${sale.id} gerada com sucesso`,
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8">
      <PageHeader 
        title="Ponto de Venda" 
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Operador: <span className="font-semibold">{user?.name}</span>
            </span>
            <Button 
              variant={scannerActive ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                setScannerActive(!scannerActive);
                toast({
                  title: scannerActive ? "Scanner desativado" : "Scanner ativado",
                  description: scannerActive ? "Use o mouse para selecionar produtos" : "Use o leitor de código de barras",
                });
              }}
            >
              <ScanBarcode className="mr-2 h-4 w-4" />
              {scannerActive ? "Scanner Ativo" : "Ativar Scanner"}
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-4"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.price.toFixed(2)} Kz
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estoque: {product.stock}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente (Opcional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-64 overflow-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrinho vazio
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.price.toFixed(2)} Kz cada
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-10 text-center font-medium text-sm">
                            {item.quantity}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-semibold text-sm w-20 text-right">
                          {(item.price * item.quantity).toFixed(2)} Kz
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select defaultValue="numerario">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numerario">Numerário</SelectItem>
                      <SelectItem value="tpa">TPA</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="multicaixa">Multicaixa Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Desconto (Kz)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1 text-sm pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} Kz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impostos:</span>
                    <span>{tax.toFixed(2)} Kz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto:</span>
                    <span>-{discount.toFixed(2)} Kz</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} Kz</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleFinalizeSale}>
                  Finalizar Venda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
