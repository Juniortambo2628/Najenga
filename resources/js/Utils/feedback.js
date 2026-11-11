/*
 * App-wide confirmations, from the kit (@okjt/ui), usable from any handler
 * without hooks:
 *   if (!(await confirmAction('Delete this expense?'))) return;
 *   const name = await promptAction({ title: 'Rename folder', label: 'Name', defaultValue });
 * The kit's <ConfirmHost/> (mounted once in the app) renders the dialog.
 */
export { confirmAction, confirmOptions, promptAction, registerConfirmHost } from '@okjt/ui';
