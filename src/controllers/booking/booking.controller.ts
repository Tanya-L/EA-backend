import {NextFunction, Request, Response} from 'express';
import {BookingStorage} from "../../database/booking-storage";
import {SessionStorage} from "../../database/session-storage";
import moment from "moment";
import {BookingResult} from "@controllers/booking/bookingResult";
import {Booking} from "../../database/booking";

// GET /booking
// Return available bookings for anonymous user
// Every day is returned as DayBooking[], each containing BookingSlot[]
export const getBookingController = (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);

    // Admin session invalid, return anonymous available bookings
    const availableSlots = BookingStorage.getAvailableSlots(weekNum);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({result: availableSlots}));
};

// POST /booking -- create new booking
// {
//     "timestamp": "2020-05-25T00:00:00.000Z",
//     "booking": { "name": "le chat", "comments": "", "phone": "666" }
// }
export const postBookingController = (req: Request, resp: Response, next: NextFunction) => {
    const timestamp: moment.Moment = moment(req.body['timestamp']);
    const bookingReq = req.body['booking'];
    let booking: Booking = new Booking(
        bookingReq['name'],
        bookingReq['phone'],
        bookingReq['comments'],
        "");

    // Admin session invalid, return anonymous available bookings
    const result: BookingResult = BookingStorage.createBooking(timestamp, booking);
    if (result.ok) {
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: true, bookingCode: result.code}));
    } else {
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: false, reason: result.reason}));
    }
};

// GET /booking/admin
// Return all booking slots for the week for admin, and all booking info
export const getAdminBookingController = (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);
    const sessionToken: string = req.query['token'];

    if (SessionStorage.checkValid(sessionToken)) {
        // Admin session is valid, return everything
        const weekBookings = BookingStorage.getAllBookings(weekNum);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({result: weekBookings}));
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send({result: "badsession"});
    }
};
