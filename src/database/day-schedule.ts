import {IBookingSlot} from "./bookingslot.types";
import moment from "moment";

export interface IDaySchedule {
    dayDate?: string, // iso-date, from the dayMoment
    dayMoment: moment.Moment,
    slots: IBookingSlot[],
}

export class DaySchedule implements IDaySchedule {
    constructor(
        public dayDate: string,
        public dayMoment: moment.Moment,
        public slots: IBookingSlot[]) {
    }
}