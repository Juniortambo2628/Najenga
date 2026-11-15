/*
 * Which forms on the page have unsaved edits: the OKJT kit's page-wide record.
 * useUnsavedChangesGuard reports to it (through the kit's guard) and the
 * navbar reads it.
 */
export { useHasUnsavedChanges, hasUnsavedChanges } from '@okjt/dashboard';
