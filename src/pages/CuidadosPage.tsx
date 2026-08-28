import { ArrowRight, BugOff, Droplets, Scissors, Shovel, Sparkles, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'

const topics = [
  { icon: Sun, title: 'Luminosidade', description: 'Observe quantas horas de sol direto ou indireto o local recebe antes de escolher a planta e o ponto onde ela vai ficar.' },
  { icon: Droplets, title: 'Rega', description: 'Regue quando a camada superior do substrato estiver seca ao toque. Excesso de água é a causa mais comum de problemas.' },
  { icon: Shovel, title: 'Substrato e drenagem', description: 'Use um substrato compatível com a espécie e garanta que o vaso tenha furos de drenagem para evitar apodrecimento das raízes.' },
  { icon: Sparkles, title: 'Adubação', description: 'Siga sempre a dosagem indicada no rótulo do fertilizante. Adubar em excesso pode queimar as raízes da planta.' },
  { icon: Scissors, title: 'Poda e manutenção', description: 'Remova folhas secas ou amareladas regularmente para estimular o crescimento saudável e prevenir doenças.' },
  { icon: BugOff, title: 'Pragas comuns', description: 'Observe as folhas periodicamente. Manchas, teias finas ou insetos visíveis são sinais para agir cedo.' },
]

export function CuidadosPage() {
  return <section className="content-page">
    <PageHeader title="Cuidados" subtitle="Orientações gerais para manter suas plantas saudáveis." />
    <div className="care-topics">
      {topics.map(({ icon: Icon, title, description }) => (
        <article className="care-topic-card" key={title}>
          <Icon aria-hidden="true" />
          <div><h2>{title}</h2><p>{description}</p></div>
        </article>
      ))}
    </div>
    <div className="care-cta">
      <p>Não sabe qual planta combina com você? A Flora indica opções do nosso catálogo.</p>
      <Link className="touch-button touch-button--primary" to="/escolher">Quero escolher uma planta<ArrowRight aria-hidden="true" /></Link>
    </div>
  </section>
}
