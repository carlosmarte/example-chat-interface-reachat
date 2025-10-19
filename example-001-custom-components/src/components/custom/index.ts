/**
 * Custom Components Registry
 *
 * This module exports all custom components and automatically registers them
 * in the component registry for use with message rendering.
 */

import { registerComponent } from '../../utils/componentRegistry'
import { CodeBlock } from './CodeBlock'
import { ActionCard } from './ActionCard'
import { DataTable } from './DataTable'
import { CustomContainer } from './CustomContainer'
import { RadioGroup } from './RadioGroup'
import { List } from './List'
import { LivePreview } from './LivePreview'
import { MultiChoice } from './MultiChoice'

// Export all custom components
export { CodeBlock } from './CodeBlock'
export { ActionCard } from './ActionCard'
export { DataTable } from './DataTable'
export { CustomContainer } from './CustomContainer'
export { RadioGroup } from './RadioGroup'
export { List } from './List'
export { LivePreview } from './LivePreview'
export { MultiChoice } from './MultiChoice'

// Export component props types
export type { CodeBlockProps } from './CodeBlock'
export type { ActionCardProps } from './ActionCard'
export type { DataTableProps, DataTableColumn } from './DataTable'
export type { CustomContainerProps } from './CustomContainer'
export type { RadioGroupProps, RadioOption } from './RadioGroup'
export type { ListProps, ListItem } from './List'
export type { LivePreviewProps } from './LivePreview'
export type { MultiChoiceProps, MultiChoiceOption } from './MultiChoice'

/**
 * Register all custom components in the global registry
 * Call this function once at app initialization
 */
export function registerAllCustomComponents(): void {
  registerComponent('CodeBlock', CodeBlock)
  registerComponent('ActionCard', ActionCard)
  registerComponent('DataTable', DataTable)
  registerComponent('CustomContainer', CustomContainer)
  registerComponent('RadioGroup', RadioGroup)
  registerComponent('List', List)
  registerComponent('LivePreview', LivePreview)
  registerComponent('MultiChoice', MultiChoice)
}

// Auto-register components when this module is imported
registerAllCustomComponents()
