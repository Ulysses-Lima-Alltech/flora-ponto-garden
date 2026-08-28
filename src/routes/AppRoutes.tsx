import { Route, Routes } from 'react-router-dom'
import { KioskShell } from '../components/layout/KioskShell'
import { AccessPage } from '../pages/AccessPage'
import { AjudaPage } from '../pages/AjudaPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { ComparisonPage } from '../pages/ComparisonPage'
import { CuidadosPage } from '../pages/CuidadosPage'
import { FavoritosPage } from '../pages/FavoritosPage'
import { HistoricoPage } from '../pages/HistoricoPage'
import { HomePage } from '../pages/HomePage'
import { PedidoPage } from '../pages/PedidoPage'
import { PlantFinderPage } from '../pages/PlantFinderPage'
import { ProductPage } from '../pages/ProductPage'
import { ScannerPage } from '../pages/ScannerPage'

export function AppRoutes() {
  return <KioskShell><Routes><Route path="/" element={<HomePage />} /><Route path="/categorias" element={<CategoriesPage />} /><Route path="/acesso" element={<AccessPage />} /><Route path="/escolher" element={<PlantFinderPage />} /><Route path="/comparar" element={<ComparisonPage />} /><Route path="/produto/:productId" element={<ProductPage />} /><Route path="/cuidados" element={<CuidadosPage />} /><Route path="/scanner" element={<ScannerPage />} /><Route path="/favoritos" element={<FavoritosPage />} /><Route path="/historico" element={<HistoricoPage />} /><Route path="/ajuda" element={<AjudaPage />} /><Route path="/pedido" element={<PedidoPage />} /><Route path="*" element={<ComingSoonPage title="Pagina nao encontrada" description="Volte ao inicio para continuar sua jornada." />} /></Routes></KioskShell>
}
