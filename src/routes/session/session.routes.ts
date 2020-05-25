import {Route} from '@liftr/core';
import {sessionControllerLogin, sessionControllerLogout} from '@controllers/session/session.controller';

export const sessionLoginRoute = Route.get('/login', sessionControllerLogin);
export const sessionLogoutRoute = Route.get('/logout', sessionControllerLogout);
