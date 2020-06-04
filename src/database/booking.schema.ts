import {Schema} from "mongoose";

const BookingSchema = new Schema({
    isActive: Boolean,
    name: String,
    phone: String,
    comments: String,
    bookingCode: String,
    hourKey: String,
});

export default BookingSchema;
