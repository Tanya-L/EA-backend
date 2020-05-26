import moment from "moment";
import {ScheduleManager} from "./schedule-manager";
import {DayBooking} from "./day-booking";
import {BookingResult} from "./bookingResult";
import {Booking} from "./booking";

let bookingStorage_: Map<string, Booking> = new Map();

export class BookingStorage {
    static getAvailableSlots(weekNum: number): DayBooking[] {
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
            let dayBooking = {dayDate: moment(iterDate), slots: []};

            // for each hour of the day
            for (let workingHour = opening; workingHour <= closing; workingHour++) {
                let iterTime = moment(iterDate)
                    .hour(workingHour).minute(0).second(0).millisecond(0);

                dayBooking.slots.push({
                    hour: workingHour,
                    available: !BookingStorage.checkBookingExists(iterTime)
                });
            }

            result.push(dayBooking);
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
            let dayBooking = {dayDate: moment(iterDate), slots: []};

            // for each hour of the day
            for (let workingHour = opening; workingHour < closing; workingHour++) {
                let iterTime = moment(iterDate)
                    .hour(workingHour).minute(0).second(0).millisecond(0);

                const booking = BookingStorage.getBooking(iterTime);

                if (booking) {
                    dayBooking.slots.push({
                        hour: workingHour,
                        available: false,
                        booking: Booking,
                    });
                } else {
                    dayBooking.slots.push({
                        hour: workingHour,
                        available: true,
                    });
                }
            }

            result.push(dayBooking);
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
        return bookingStorage_.has(BookingStorage.keyFrom(t));
    }

    private static getBooking(t: moment.Moment): Booking {
        return bookingStorage_.get(BookingStorage.keyFrom(t));
    }

    static createBooking(timestamp: moment.Moment, booking: Booking): BookingResult {
        const t = timestamp.minute(0).second(0).millisecond(0);

        // check booking not undefined
        if (!booking) {
            return new BookingResult(false, "", "badRequest");
        }

        // check not exists?
        if (BookingStorage.checkBookingExists(t)) {
            return new BookingResult(false, "", "bookingExists");
        }

        // check working day?
        if (!ScheduleManager.isWorkingDay(t)) {
            return new BookingResult(false, "", "notWorkingDay");
        }

        // check working hours
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
        return Math.random().toString(10).substring(2, 8);
    }
}
