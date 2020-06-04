import {IBooking} from "./booking.types";

export interface IBookingSlot {
    hour: number,
    available: boolean,
    booking?: IBooking, // set when admin is requesting slots
}

export class BookingSlot implements IBookingSlot {
    constructor(
        public available: boolean,
        public booking: IBooking,
        public hour: number,
    ) {
    }
}