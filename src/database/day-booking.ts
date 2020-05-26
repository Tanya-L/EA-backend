import {BookingSlot} from "./booking-slot";

export interface DayBooking {
    dayDate: string, // iso-date
    slots: BookingSlot[],
}