import { CircleUserRound, ClipboardList, GitCompareArrows, Heart, History, LifeBuoy, PackageSearch, ScanBarcode, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { isHardwareScanMode } from '../features/scanner/ScannerService'

const topics = [
  { icon: Sprout, title: 'Escolher uma planta', description: 'Responda um questionário rápido e veja plantas do catálogo que combinam com seu ambiente e disponibilidade.', to: '/escolher' },
  { icon: PackageSearch, title: 'Ver o catálogo completo', description: 'Busque por nome, descrição ou código, ou filtre por categoria.', to: '/categorias' },
  { icon: GitCompareArrows, title: 'Comparar plantas', description: 'Escolha até duas plantas para ver os cuidados lado a lado.', to: '/comparar' },
  {
    icon: ScanBarcode,
    title: 'Escanear um produto',
    description: isHardwareScanMode
      ? 'Use o leitor de código de barras do totem para abrir direto a página de um produto.'
      : 'Use a câmera do celular ou o leitor do totem para abrir direto a página de um produto.',
    to: '/scanner',
  },
  { icon: CircleUserRound, title: 'Meu acesso', description: 'Entre com seu celular para ver dicas, consultas e recomendações personalizadas.', to: '/acesso' },
  { icon: Heart, title: 'Favoritos', description: 'Produtos que você salvou para consultar depois, associados ao seu acesso.', to: '/favoritos' },
  { icon: History, title: 'Histórico', description: 'Últimos produtos que você consultou neste totem.', to: '/historico' },
  { icon: ClipboardList, title: 'Minha lista', description: 'Reúna os itens que você quer levar e mostre a lista para um vendedor da loja.', to: '/pedido' },
]

export function AjudaPage() {
  return <section className="content-page">
    <PageHeader title="Ajuda" subtitle="Veja como aproveitar tudo o que a Flora pode fazer por você." />
    <div className="help-topics">
      {topics.map(({ icon: Icon, title, description, to }) => (
        <Link className="help-topic-card" key={to} to={to}>
          <Icon aria-hidden="true" />
          <div><strong>{title}</strong><p>{description}</p></div>
        </Link>
      ))}
    </div>
    <div className="help-support-note">
      <LifeBuoy aria-hidden="true" />
      <span>Precisa de mais ajuda? Procure um de nossos vendedores na loja — eles podem te acompanhar em qualquer etapa.</span>
    </div>
  </section>
}
