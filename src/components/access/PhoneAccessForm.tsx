import { LoaderCircle, Smartphone } from 'lucide-react'
import { TouchButton } from '../ui/TouchButton'

interface PhoneAccessFormProps {
  phone: string
  error: string | null
  isLoading: boolean
  onPhoneChange: (value: string) => void
  onSubmit: () => void
  onContinueWithoutAccess: () => void
}

export function PhoneAccessForm({ phone, error, isLoading, onPhoneChange, onSubmit, onContinueWithoutAccess }: PhoneAccessFormProps) {
  const errorId = 'phone-access-error'
  return <div className="access-panel"><Smartphone aria-hidden="true" /><div><h2>Consulte seu jardim com a Flora</h2><p>Digite seu celular para consultar seus produtos, recomendações e dicas personalizadas.</p></div><form className="phone-access-form" onSubmit={(event) => { event.preventDefault(); onSubmit() }}><label htmlFor="customer-phone">Celular</label><input id="customer-phone" type="tel" inputMode="numeric" autoComplete="off" placeholder="(11) 99999-9999" value={phone} maxLength={15} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} onChange={(event) => onPhoneChange(event.target.value)} />{error && <p id={errorId} className="form-error" role="alert">{error}</p>}<TouchButton type="submit" disabled={isLoading}>{isLoading && <LoaderCircle className="loading-icon" aria-hidden="true" />} {isLoading ? 'Consultando conta...' : 'Acessar minha conta'}</TouchButton></form><TouchButton variant="secondary" className="continue-without-access" onClick={onContinueWithoutAccess}>Continuar sem acesso</TouchButton><p className="access-hint">Você pode utilizar a Flora normalmente sem acessar uma conta.</p></div>
}
