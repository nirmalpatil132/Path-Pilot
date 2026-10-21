import type { BadgeVariant } from '@/components/ui'

export function getCategoryBadgeVariant(category: string): BadgeVariant {
  switch (category.toLowerCase()) {
    case 'engineering':
      return 'primary'
    case 'data':
      return 'success'
    case 'security':
      return 'danger'
    case 'infrastructure':
      return 'warning'
    case 'design':
      return 'neutral'
    default:
      return 'default'
  }
}
