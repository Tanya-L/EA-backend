import {Request, Response, NextFunction} from 'express';

const bcrypt = require('bcrypt');
const adminPasswordSalt = '$2b$10$gdj6vBRcFKFsjVJD.17uRu';
const adminPasswordHash = '$2b$10$gdj6vBRcFKFsjVJD.17uRuJaJecCFtXrATXYnX1OGm3knzZ8BYGNe';

let sessionStorage = {};

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

    res.send(JSON.stringify(response));
};

export const sessionControllerLogout = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.query['token'];
    delete sessionStorage[token];
    res.send(JSON.stringify({result: true}));
};

function createSession(login: string) {
    const sessionToken = bcrypt.genSaltSync(10);
    sessionStorage[sessionToken] = {
        login: login,
        createdAt: new Date(),
    };
    // TODO: Clean old sessions, clean if too many sessions
    return sessionToken;
}
