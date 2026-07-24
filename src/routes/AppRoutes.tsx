import { Route, Routes } from 'react-router-dom'
import { KioskShell } from '../components/layout/KioskShell'
import { AccessPage } from '../pages/AccessPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { ComparisonPage } from '../pages/ComparisonPage'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { HomePage } from '../pages/HomePage'
import { PlantFinderPage } from '../pages/PlantFinderPage'
import { ProductPage } from '../pages/ProductPage'

const pages = {
  care: ['Cuidados', 'Orientacoes simples para acompanhar a saude da sua planta.'],
  scanner: ['Escanear produto', 'A leitura por camera sera conectada ao hardware do totem em breve.'],
  favorites: ['Favoritos', 'Aqui ficarao os produtos que voce salvou para consultar depois.'],
  history: ['Historico', 'Aqui aparecerao os ultimos produtos visualizados.'],
  help: ['Ajuda', 'Encontre apoio para navegar pela Flora e tirar duvidas na loja.'],
  order: ['Meu pedido', 'Revise os itens que voce deseja encontrar na loja.'],
} as const

const placeholder = (key: keyof typeof pages) => <ComingSoonPage title={pages[key][0]} description={pages[key][1]} />

export function AppRoutes() {
  return <KioskShell><Routes><Route path="/" element={<HomePage />} /><Route path="/categorias" element={<CategoriesPage />} /><Route path="/acesso" element={<AccessPage />} /><Route path="/escolher" element={<PlantFinderPage />} /><Route path="/comparar" element={<ComparisonPage />} /><Route path="/produto/:productId" element={<ProductPage />} /><Route path="/cuidados" element={placeholder('care')} /><Route path="/scanner" element={placeholder('scanner')} /><Route path="/favoritos" element={placeholder('favorites')} /><Route path="/historico" element={placeholder('history')} /><Route path="/ajuda" element={placeholder('help')} /><Route path="/pedido" element={placeholder('order')} /><Route path="*" element={<ComingSoonPage title="Pagina nao encontrada" description="Volte ao inicio para continuar sua jornada." />} /></Routes></KioskShell>
}
