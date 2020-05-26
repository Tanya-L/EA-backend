import {NextFunction, Request, Response} from 'express';
import {BookingStorage} from "../../database/booking-storage";
import {SessionStorage} from "../../database/session-storage";

// GET /booking
// Return available bookings for anonymous user
// Every day is returned as DayBooking[], each containing BookingSlot[]
export const bookingGetController = (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);

    // Admin session invalid, return anonymous available bookings
    const availableSlots = BookingStorage.getAvailableSlots(weekNum);
    res.send(JSON.stringify({result: availableSlots}));
};

// GET /booking/admin
// Return all booking slots for the week for admin, and all booking info
export const adminBookingGetController = (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);
    const sessionToken: string = req.query['token'];

    if (SessionStorage.checkValid(sessionToken)) {
        // Admin session is valid, return everything
        const weekBookings = BookingStorage.getAllBookings(weekNum);
        res.send(JSON.stringify({result: weekBookings}));
    } else {
        res.send({result: "badsession"});
    }
};
