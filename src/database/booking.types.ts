import {Document, Model} from "mongoose";

export interface IBooking {
    hourKey: string, // key formatted using BookingStorage.keyFrom(t)
    isActive: boolean,
    name: string,
    phone: string,
    comments: string,
    bookingCode: string,
}

export class Booking implements IBooking {
    public hourKey: string;
    constructor(
        public isActive: boolean,
        public name: string,
        public phone: string,
        public comments: string,
        public bookingCode: string
    ) {
    }
}

export interface IBookingDocument extends IBooking, Document {
}

export interface IBookingModel extends Model<IBookingDocument> {
}
