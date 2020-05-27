import {Booking} from "./booking";

export interface BookingSlot {
    hour: number,
    available: boolean,
    booking?: Booking, // set when admin is requesting slots
}