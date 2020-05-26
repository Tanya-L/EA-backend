import {NextFunction, Request, Response} from 'express';
import bcrypt from "bcrypt";
import {SessionStorage} from "../../database/session-storage";

const adminPasswordSalt = '$2b$10$gdj6vBRcFKFsjVJD.17uRu';
const adminPasswordHash = '$2b$10$gdj6vBRcFKFsjVJD.17uRuJaJecCFtXrATXYnX1OGm3knzZ8BYGNe';

// GET session/login
export const sessionControllerLogin = (req: Request, res: Response, next: NextFunction) => {
    const login: string = req.query['login'];
    const password: string = req.query['password'];

    const hash = bcrypt.hashSync(password, adminPasswordSalt);
    let response: object;

    if (login == 'admin' && hash == adminPasswordHash) {
        const sessionToken = createSession(login);
        response = {result: true, token: sessionToken};
    } else {
        response = {result: false};
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response));
};

// GET session/logout
export const sessionControllerLogout = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.query['token'];
    SessionStorage.deleteSession(token);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({result: true}));
};

function createSession(login: string) {
    return SessionStorage.createSession(login);
    // TODO: Clean old sessions, clean if too many sessions
}
