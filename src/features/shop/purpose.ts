/** Metadata marker so a store checkout is never applied as a SaaS Pro grant. */
export const SHOP_PURPOSE = 'shop'

export function isShopPurpose(meta: { purpose?: string } | null | undefined): boolean {
  return meta?.purpose === SHOP_PURPOSE
}
