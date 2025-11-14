import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const salesData = [
  { month: "Jan", vendas: 4000, receita: 2400 },
  { month: "Fev", vendas: 3000, receita: 1398 },
  { month: "Mar", vendas: 2000, receita: 9800 },
  { month: "Abr", vendas: 2780, receita: 3908 },
  { month: "Mai", vendas: 1890, receita: 4800 },
  { month: "Jun", vendas: 2390, receita: 3800 },
];

const categoryData = [
  { name: "Alimentos", value: 400 },
  { name: "Bebidas", value: 300 },
  { name: "Higiene", value: 200 },
  { name: "Limpeza", value: 100 },
];

const COLORS = ["hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function Reports() {
  return (
    <div className="flex-1 p-8">
      <PageHeader
        title="Relatórios e Análises"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">R$ 0,00</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 0,00</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Vendidos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas e Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="hsl(142, 76%, 36%)" />
                <Bar dataKey="receita" fill="hsl(217, 91%, 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma venda registrada
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Todos os produtos com estoque adequado
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
