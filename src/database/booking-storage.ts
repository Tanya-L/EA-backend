import moment from "moment";
import {ScheduleManager} from "./schedule-manager";
import {DaySchedule, DayScheduleImpl} from "./day-schedule";
import {BookingResult} from "./bookingResult";
import {Booking} from "./booking";

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
                delete booking['bookingCode'];

                if (booking) {
                    daySchedule.slots.push({
                        hour: workingHour,
                        available: false,
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
        return bookingStorage_.has(BookingStorage.keyFrom(t));
    }

    private static getBooking(t: moment.Moment): Booking {
        return Object.assign( // clone
            {},
            bookingStorage_.get(BookingStorage.keyFrom(t))
        );
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
