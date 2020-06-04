import {NextFunction, Request, Response} from 'express';
import {BookingStorage} from "../../database/booking-storage";
import {SessionStorage} from "../../database/session-storage";
import moment from "moment";
import {
    Booking,
    IBooking,
    IBookingDocument
} from "../../database/booking.types";
import {BookingResult} from "../../database/bookingresult.types";
import { BookingModel } from '../../database/booking.model';

// GET /booking?week=22
// Return available bookings for anonymous user
// Every day is returned as DayBooking[], each containing BookingSlot[]
export const getBookingController = async (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);

    // Admin session invalid, return anonymous available bookings
    return BookingStorage.getAvailableSlots(weekNum)
        .then(availableSlots => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({result: availableSlots}));
        });
};

// POST /booking -- create new booking
// {
//     "timestamp": "2020-05-25T00:00:00.000Z",
//     "booking": { "name": "le chat", "comments": "", "phone": "666" },
//     "token": "asdsadasdsadas" - for admin access
// }
export const postBookingController = async (req: Request, resp: Response, next: NextFunction) => {
    const timestamp: moment.Moment = moment(req.body['timestamp']);
    const token: string = req.body['token'];
    const bookingReq = req.body['booking'];
    let booking = new BookingModel({
        isActive: true,
        name: bookingReq['name'],
        phone: bookingReq['phone'],
        comments: bookingReq['comments'],
        hourKey: "",
        bookingCode: "",
    });

    // Admin session invalid, return anonymous available bookings
    // Possible errors:
    //  badRequest (missing 'booking' in request)
    //  inThePast -- booking in the past
    //  bookingExists -- already booked
    //  notWorkingDay
    //  notWorkingHour
    return BookingStorage.createBooking(timestamp, booking, token)
        .then((result: BookingResult) => {
            if (result.ok) {
                resp.setHeader('Content-Type', 'application/json');
                resp.send(JSON.stringify({
                    result: true,
                    bookingCode: result.code
                }));
            } else {
                resp.setHeader('Content-Type', 'application/json');
                resp.send(JSON.stringify({
                    result: false,
                    reason: result.reason
                }));
            }
        });
};

// DELETE /booking?token=TTTT&bookingCode=123456
export const deleteBookingController = async (req: Request, resp: Response, next: NextFunction) => {
    const token: string = req.query['token'];
    const bookingCode = req.query['bookingCode'];

    // Admin session invalid, return anonymous available bookings
    return BookingStorage.cancelBooking(bookingCode, token)
        .then(reason => {
            if (reason === "") {
                resp.setHeader('Content-Type', 'application/json');
                resp.send(JSON.stringify({result: true}));
            } else {
                resp.setHeader('Content-Type', 'application/json');
                resp.send(JSON.stringify({result: false, reason: reason}));
            }
        });
};

// GET /booking/admin
// Return all booking slots for the week for admin, and all booking info
export const getAdminBookingController = async (req: Request, res: Response, next: NextFunction) => {
    const weekNum: number = parseInt(req.query['week']);
    const sessionToken: string = req.query['token'];

    if (SessionStorage.checkValid(sessionToken)) {
        // Admin session is valid, return everything
        return BookingStorage.getAllBookings(weekNum)
            .then(weekBookings => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({result: weekBookings}));
            });
    } else {
        return Promise.resolve().then(_ => {
            res.setHeader('Content-Type', 'application/json');
            res.send({result: "badsession"});
        });
    }
};
