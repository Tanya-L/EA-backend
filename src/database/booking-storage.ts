import moment from "moment";
import {ScheduleManager} from "./schedule-manager";
import {Booking} from "./booking";

let bookingStorage_: Map<moment.Moment, Booking> = new Map();

interface BookingSlot {
    hour: number,
    available: boolean,
    booking?: Booking, // set when admin is requesting slots
}

interface DayBooking {
    dayDate: string, // iso-date
    slots: BookingSlot[],
}

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
                let iterTime = iterDate.add(workingHour, 'h');

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
            for (let workingHour = opening; workingHour <= closing; workingHour++) {
                let iterTime = iterDate.add(workingHour, 'h');
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

    private static checkBookingExists(t: moment.Moment): boolean {
        return bookingStorage_.has(t);
    }

    private static getBooking(t: moment.Moment): Booking {
        return bookingStorage_.get(t);
    }
}
