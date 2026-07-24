import type { ImgHTMLAttributes } from 'react'

interface CatalogProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'src'> {
  src: string
}

export function CatalogProductImage({ src, alt, ...props }: CatalogProductImageProps) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={(event) => { if (event.currentTarget.dataset.fallbackApplied) return; event.currentTarget.dataset.fallbackApplied = 'true'; event.currentTarget.src = '/products/product-placeholder.svg' }} {...props} />
}
