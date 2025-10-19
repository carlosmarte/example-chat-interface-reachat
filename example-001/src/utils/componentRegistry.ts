import type { ComponentType } from 'react'

// Type for component registry
type ComponentRegistry = Map<string, ComponentType<any>>

// Global registry instance
const registry: ComponentRegistry = new Map()

/**
 * Register a custom component in the registry
 * @param name - Unique name for the component
 * @param component - React component to register
 */
export function registerComponent(name: string, component: ComponentType<any>): void {
  if (registry.has(name)) {
    console.warn(`Component "${name}" is already registered. Overwriting...`)
  }
  registry.set(name, component)
}

/**
 * Get a component from the registry by name
 * @param name - Name of the component to retrieve
 * @returns The component if found, undefined otherwise
 */
export function getComponent(name: string): ComponentType<any> | undefined {
  return registry.get(name)
}

/**
 * Unregister a component from the registry
 * @param name - Name of the component to unregister
 * @returns true if component was removed, false if it didn't exist
 */
export function unregisterComponent(name: string): boolean {
  return registry.delete(name)
}

/**
 * Check if a component is registered
 * @param name - Name of the component to check
 * @returns true if component exists in registry
 */
export function hasComponent(name: string): boolean {
  return registry.has(name)
}

/**
 * Get all registered component names
 * @returns Array of registered component names
 */
export function getRegisteredComponents(): string[] {
  return Array.from(registry.keys())
}

/**
 * Clear all components from the registry
 */
export function clearRegistry(): void {
  registry.clear()
}
