import moment from "moment";
import {ScheduleManager} from "./schedule-manager";
import {DaySchedule, DayScheduleImpl} from "./day-schedule";
import {BookingResult} from "./bookingResult";
import {Booking, BookingImpl} from "./booking";
import {SessionStorage} from "./session-storage";

let bookingStorage_: Map<string, Booking> = new Map();

export class BookingStorage {
    static getAvailableSlots(weekNum: number): DaySchedule[] {
        let result = [];
        let iterDate = moment().utc()
            .week(weekNum)
            .day(1)
            .hour(0).minute(0).second(0).millisecond(0);

        // for each day
        for (let weekDay = 0; weekDay <= 6; weekDay++) {
            if (!ScheduleManager.isWorkingDay(iterDate)) {
                // not a working day
                continue;
            }

            const openingHours = ScheduleManager.getOpeningHours(iterDate);
            let opening = openingHours[0];
            let closing = openingHours[1];
            let daySchedule = {dayDate: moment(iterDate), slots: []};

            // for each hour of the day
            for (let workingHour = opening; workingHour <= closing; workingHour++) {
                let iterTime = moment(iterDate)
                    .hour(workingHour).minute(0).second(0).millisecond(0);

                daySchedule.slots.push({
                    hour: workingHour,
                    available: !BookingStorage.checkBookingExists(iterTime)
                });
            }

            result.push(daySchedule);
            iterDate = iterDate.add(1, 'd');
        }

        return result;
    }

    // Admin function: Returns all slots which are booked
    static getAllBookings(weekNum: number) {
        let result = [];
        let iterDate = moment().utc()
            .week(weekNum)
            .day(1)
            .hour(0).minute(0).second(0).millisecond(0);

        // for each day
        for (let weekDay = 0; weekDay <= 6; weekDay++) {
            if (!ScheduleManager.isWorkingDay(iterDate)) {
                continue;
            }

            const openingHours = ScheduleManager.getOpeningHours(iterDate);
            let opening = openingHours[0];
            let closing = openingHours[1];
            let daySchedule: DaySchedule = new DayScheduleImpl(
                moment(iterDate).toISOString(),
                []
            );

            // for each hour of the day
            for (let workingHour = opening; workingHour < closing; workingHour++) {
                let iterTime = moment(iterDate)
                    .hour(workingHour).minute(0).second(0).millisecond(0);

                const booking = BookingStorage.getBooking(iterTime);
                //delete booking['bookingCode'];

                if (booking) {
                    daySchedule.slots.push({
                        hour: workingHour,
                        available: !booking.isActive,
                        booking: booking,
                    });
                } else {
                    daySchedule.slots.push({
                        hour: workingHour,
                        available: true,
                    });
                }
            }

            result.push(daySchedule);
            iterDate = iterDate.add(1, 'd');
        }

        return result;
    }

    static keyFrom(t: moment.Moment): string {
        return t
            .utc()
            .format("YYYYMMDD-HHmm");
    }

    private static checkBookingExists(t: moment.Moment): boolean {
        const key = BookingStorage.keyFrom(t);
        if (!bookingStorage_.has(key)) {
            return false;
        }
        return bookingStorage_.get(key).isActive;
    }

    private static getBooking(t: moment.Moment): Booking {
        return Object.assign( // clone
            {},
            bookingStorage_.get(BookingStorage.keyFrom(t))
        );
    }

    static createBooking(timestamp: moment.Moment,
                         booking: Booking,
                         token: string): BookingResult {
        const isAdmin: boolean = SessionStorage.checkValid(token);
        const t = timestamp.minute(0).second(0).millisecond(0);

        // check booking not undefined
        if (!booking) {
            return new BookingResult(false, "", "badRequest");
        }

        if (timestamp.isBefore(moment())) {
            return new BookingResult(false, "", "inThePast");
        }

        // check not exists? But allow if admin
        if (BookingStorage.checkBookingExists(t) && !isAdmin) {
            return new BookingResult(false, "", "bookingExists");
        }

        // check working day?
        if (!ScheduleManager.isWorkingDay(t)) {
            return new BookingResult(false, "", "notWorkingDay");
        }

        // check working hours?
        const openingHours = ScheduleManager.getOpeningHours(t);
        const opening = openingHours[0];
        const closing = openingHours[1];
        if (t.hour() < opening || t.hour() >= closing) {
            return new BookingResult(false, "", "notWorkingHour");
        }

        booking.bookingCode = BookingStorage.generateBookingCode();
        bookingStorage_.set(BookingStorage.keyFrom(t), booking);

        return new BookingResult(true, booking.bookingCode, "");
    }

    private static generateBookingCode() {
        // Short booking code
        // TODO: Check unique code in last 3 weeks
        let code: string;
        for (;;) {
            code = Math.random().toString(10).substring(2, 8);
            if (!BookingStorage.bookingCodeExists(code)) {
                break; // new unique code!
            }
        }
        return code;
    }

    // Cancel a booking. Returns "" for OK, or returns reason "notExists"
    static cancelBooking(bookingCode: string, token: string): string {
        let keys: string[] = [];
        bookingStorage_.forEach((b: Booking, key: string) => {
            if (b.bookingCode == bookingCode) {
                keys.push(key);
            }
        });

        // unbook first
        if (keys.length > 0) {
            bookingStorage_.get(keys[0]).isActive = false;
            return ""; // success
        }

        return "notExists";
    }

    private static bookingCodeExists(code: string): boolean {
        let result: boolean = false;
        bookingStorage_.forEach((b: Booking) => {
            if (b.bookingCode == code) {
                result = true;
            }
        });
        return result;
    }
}
