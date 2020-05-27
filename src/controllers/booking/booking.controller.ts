import {NextFunction, Request, Response} from 'express';
import {BookingStorage} from "../../database/booking-storage";
import {SessionStorage} from "../../database/session-storage";
import moment from "moment";
import {Booking, BookingImpl} from "../../database/booking";
import {BookingResult} from "../../database/bookingResult";

// GET /booking?week=22
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
//     "booking": { "name": "le chat", "comments": "", "phone": "666" },
//     "token": "asdsadasdsadas" - for admin access
// }
export const postBookingController = (req: Request, resp: Response, next: NextFunction) => {
    const timestamp: moment.Moment = moment(req.body['timestamp']);
    const token: string = req.body['token'];
    const bookingReq = req.body['booking'];
    let booking: Booking = new BookingImpl(
        true,
        bookingReq['name'],
        bookingReq['phone'],
        bookingReq['comments'],
        "");

    // Admin session invalid, return anonymous available bookings
    const result: BookingResult = BookingStorage.createBooking(timestamp, booking, token);
    if (result.ok) {
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: true, bookingCode: result.code}));
    } else {
        // Possible errors:
        //  badRequest (missing 'booking' in request)
        //  inThePast -- booking in the past
        //  bookingExists -- already booked
        //  notWorkingDay
        //  notWorkingHour
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: false, reason: result.reason}));
    }
};

// DELETE /booking?token=TTTT&bookingCode=123456
export const deleteBookingController = (req: Request, resp: Response, next: NextFunction) => {
    const token: string = req.query['token'];
    const bookingCode = req.query['bookingCode'];

    // Admin session invalid, return anonymous available bookings
    const reason = BookingStorage.cancelBooking(bookingCode, token);
    if (reason === "") {
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: true}));
    } else {
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({result: false, reason: reason}));
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
