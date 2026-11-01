import { route } from './route';

// Najenga's pages call Ziggy's route() as a global, some while their module
// loads: set it before anything else is imported.
globalThis.route = route;
