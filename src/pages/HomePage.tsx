import { GitCompareArrows, HeartHandshake, PackageSearch, ScanLine, Sprout } from 'lucide-react'
import { FloraAssistant } from '../components/flora/FloraAssistant'
import { HomeActionCard } from '../components/products/HomeActionCard'

const actions = [
  { title: 'Quero escolher uma planta', description: 'Me ajude a encontrar a planta ideal.', to: '/escolher', icon: Sprout, tone: 'soft' as const },
  { title: 'Quero comparar plantas', description: 'Compare plantas e descubra quais combinam.', to: '/comparar', icon: GitCompareArrows, tone: 'purple' as const },
  { title: 'Já escolhi minha planta', description: 'Veja os itens ideais para cuidar dela.', to: '/categorias', icon: PackageSearch, tone: 'yellow' as const },
  { title: 'Preciso de ajuda com cuidados', description: 'Dicas para manter suas plantas saudáveis.', to: '/cuidados', icon: HeartHandshake, tone: 'green' as const },
]

export function HomePage() {
  return <div className="home-page"><FloraAssistant /><section className="home-actions" aria-label="Como a Flora pode ajudar">{actions.map((action) => <HomeActionCard key={action.to} {...action} />)}</section><HomeActionCard title="Escanear produto" description="Aponte o código de barras ou QR Code para buscar informações." to="/scanner" icon={ScanLine} tone="soft" variant="scanner" /></div>
}
