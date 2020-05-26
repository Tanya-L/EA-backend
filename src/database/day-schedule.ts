import {BookingSlot} from "./booking-slot";

export interface DaySchedule {
    dayDate: string, // iso-date
    slots: BookingSlot[],
}

export class DayScheduleImpl implements DaySchedule {
    constructor(
        public dayDate: string,
        public slots: BookingSlot[]) {
    }
}