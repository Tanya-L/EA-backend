
import { Request, Response, NextFunction } from 'express';

export const bookingController = (req: Request, res: Response, next: NextFunction) => {
    res.send('Lift off!');
};
