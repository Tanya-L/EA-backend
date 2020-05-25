import {Request, Response, NextFunction} from 'express';

export const sessionControllerLogin = (req: Request, res: Response, next: NextFunction) => {
    res.send('Login');
};

export const sessionControllerLogout = (req: Request, res: Response, next: NextFunction) => {
    res.send('Logout');
};
