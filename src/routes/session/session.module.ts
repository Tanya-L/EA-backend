import {Module, ModuleComponent} from '@liftr/core';
import {sessionLoginRoute, sessionLogoutRoute} from './session.routes';

export const SessionModule: ModuleComponent = Module([
    {
        route: sessionLoginRoute,
        middleware: [],
    },
    {
        route: sessionLogoutRoute,
        middleware: [],
    },
])
