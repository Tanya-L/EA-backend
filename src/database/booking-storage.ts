import {model} from "mongoose";
import moment from "moment";
import {ScheduleManager} from "./schedule-manager";
import {DaySchedule, IDaySchedule} from "./day-schedule";
import {BookingResult} from "./bookingresult.types";
import {IBooking, IBookingDocument} from "./booking.types";
import {SessionStorage} from "./session-storage";
import {BookingModel} from "./booking.model";
import {mongoConnect} from "./db";
import {BookingSlot} from "./bookingslot.types";

export class BookingStorage {
    static async getAvailableSlots(weekNum: number): Promise<IDaySchedule[]> {
        const startWeek = moment().utc()
            .weekday(1).week(weekNum)
            .hour(0).minute(0).second(0).millisecond(0);
        const endWeek = moment(startWeek).add(7, 'd');
        console.log(`start=${startWeek} end=${endWeek}`);

        mongoConnect();
        return BookingModel.find({
            age: {
                $gte: startWeek.toDate() || 0,
                $lt: endWeek.toDate() || Infinity
            }
        }).then(async (docsList) => {
            // Take list from Mongo for the given week, and map them using hourKey
            // as a key for quick search. Max 40 records per week should be fast.
            let docsMap: Map<string, IBooking> = new Map();
            docsList.forEach(d => {
                if (d.isActive) {
                    docsMap[d.hourKey] = d;
                }
            });

            let result: IDaySchedule[] = [];
            let iterDate = startWeek;
            const momentNow = moment();

            // for each day
            for (let weekDay = 0; weekDay <= 6; weekDay++) {
                if (!ScheduleManager.isWorkingDay(iterDate)) {
                    // not a working day
                    continue;
                }

                const openingHours = ScheduleManager.getOpeningHours(iterDate);
                let opening = openingHours[0];
                let closing = openingHours[1];
                let daySchedule: IDaySchedule = new DaySchedule(
                    moment(iterDate).toISOString(),
                    iterDate,
                    []
                );

                // for each hour of the day
                for (let workingHour = opening; workingHour < closing; workingHour++) {
                    let iterTime = moment(iterDate)
                        .hour(workingHour).minute(0).second(0)
                        .millisecond(0);

                    const taken = await BookingStorage.checkBookingExists(iterTime);
                    const inThePast = momentNow.isAfter(iterTime);
                    daySchedule.slots.push(new BookingSlot(
                        !taken && !inThePast,
                        null,
                        workingHour));
                }

                result.push(daySchedule);
                iterDate = iterDate.add(1, 'd');
            }

            return Promise.resolve(result);
        });
    }

    // Admin function: Returns all slots which are booked
    static async getAllBookings(weekNum: number): Promise<IDaySchedule[]> {
        const startWeek = moment().utc()
            .weekday(1).week(weekNum)
            .hour(0).minute(0).second(0).millisecond(0);
        const endWeek = moment(startWeek).add(7, 'd');

        mongoConnect();
        return BookingModel.find({
            age: {
                $gte: startWeek.toDate() || 0,
                $lt: endWeek.toDate() || Infinity
            }
        }).then(async (docsList) => {
            // Take list from Mongo for the given week, and map them using hourKey
            // as a key for quick search. Max 40 records per week should be fast.
            let docsMap: Map<string, IBooking> = new Map();
            docsList.forEach(d => {
                if (d.isActive) {
                    docsMap[d.hourKey] = d;
                }
            });

            let result: IDaySchedule[] = [];
            let iterDate = startWeek;
            const momentNow = moment();

            // for each day
            for (let weekDay = 0; weekDay <= 6; weekDay++) {
                if (!ScheduleManager.isWorkingDay(iterDate)) {
                    // not a working day
                    continue;
                }

                const openingHours = ScheduleManager.getOpeningHours(iterDate);
                let opening = openingHours[0];
                let closing = openingHours[1];
                let daySchedule: IDaySchedule = new DaySchedule(
                    moment(iterDate).toISOString(),
                    iterDate,
                    []
                );

                // for each hour of the day
                for (let workingHour = opening; workingHour < closing; workingHour++) {
                    let iterTime = moment(iterDate)
                        .hour(workingHour).minute(0).second(0)
                        .millisecond(0);

                    let booking = await BookingStorage.getBooking(iterTime);
                    const inThePast = momentNow.isAfter(iterTime);

                    if (booking !== null) {
                        daySchedule.slots.push({
                            hour: workingHour,
                            available: !booking.isActive && !inThePast,
                            booking: booking,
                        });
                    } else {
                        daySchedule.slots.push({
                            hour: workingHour,
                            available: !inThePast,
                        });
                    }
                }

                result.push(daySchedule);
                iterDate = iterDate.add(1, 'd');
            }

            return Promise.resolve(result);
        });
    }

    static keyFrom(t: moment.Moment): string {
        return t
            .utc()
            .format("YYYYMMDD-HHmm");
    }

    // Given: Mapped hour bookings for the current week, using hourKey as key
    // Finds if moment t is booked, and isActive is true
    private static async checkBookingExists(t: moment.Moment): Promise<boolean> {
        return BookingModel.find({hourKey: BookingStorage.keyFrom(t)})
            .then(docs => {
                if (docs.length > 0) {
                    return Promise.resolve(docs[0].isActive);
                }
                return Promise.resolve(false);
            });
    }

    private static async getBooking(t: moment.Moment): Promise<IBookingDocument> {
        return BookingModel.find({hourKey: BookingStorage.keyFrom(t)})
            .then(docs => {
                if (docs.length > 0) {
                    return Promise.resolve(docs[0]);
                }
                return Promise.resolve(null);
            });
    }

    static async createBooking(timestamp: moment.Moment,
                               booking: model<IBookingDocument>,
                               token: string): Promise<BookingResult> {
        mongoConnect();

        const isAdmin: boolean = SessionStorage.checkValid(token);
        const t = timestamp.minute(0).second(0).millisecond(0);

        // check booking not undefined
        if (!booking) {
            const notOk = new BookingResult(false, "", "badRequest");
            return Promise.resolve(notOk);
        }

        if (timestamp.isBefore(moment())) {
            const notOk = new BookingResult(false, "", "inThePast");
            return Promise.resolve(notOk);
        }

        // check not exists? But allow if admin
        const bookingExists = await BookingStorage.checkBookingExists(t);
        if (bookingExists && !isAdmin) {
            const notOk = new BookingResult(false, "", "bookingExists");
            return Promise.resolve(notOk);
        }

        // check working day?
        if (!ScheduleManager.isWorkingDay(t)) {
            const notOk = new BookingResult(false, "", "notWorkingDay");
            return Promise.resolve(notOk);
        }

        // check working hours?
        const openingHours = ScheduleManager.getOpeningHours(t);
        const opening = openingHours[0];
        const closing = openingHours[1];
        if (t.hour()  < opening || t.hour() >= closing) {
            const notOk = new BookingResult(false, "", "notWorkingHour");
            return Promise.resolve(notOk);
        }

        booking.bookingCode = await BookingStorage.generateBookingCode();
        booking.hourKey = BookingStorage.keyFrom(t);
        console.log(JSON.stringify(booking));

        return booking.save()
            .then(_ => new BookingResult(true, booking.bookingCode, ""))
            .catch(_ => new BookingResult(false, booking.bookingCode, "saveFailed"));
    }

    private static async generateBookingCode() {
        // Short booking code
        // TODO: Check unique code in last 3 weeks
        let code: string;
        for (; ;) {
            code = Math.random().toString(10).substring(2, 8);
            const exists = await BookingStorage.bookingCodeExists(code);
            if (!exists) {
                return code; // new unique code!
            }
        }
    }

    // Cancel a booking. Returns "" for OK, or returns reason "notExists"
    static async cancelBooking(bookingCode: string, token: string): Promise<string> {
        mongoConnect();
        const keyPrefix = this.keyFrom(moment()); // can only cancel in the future

        return BookingModel.findOneAndRemove({
            bookingCode: bookingCode,
            hourKey: {$gte: keyPrefix}
        }).then(_ => {
            return "";
        }).catch(_ => {
            return "notExists";
        });
    }

    private static async bookingCodeExists(code: string): Promise<boolean> {
        const keyPrefix = this.keyFrom(moment()); // can only cancel in the future

        return BookingModel.find({
            bookingCode: code,
            hourKey: {$gte: keyPrefix}
        }).then(bookings => {
            return Promise.resolve(bookings.length > 0);
        });
    }
}
