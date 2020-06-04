import {model} from "mongoose";
import {IBookingDocument} from "./booking.types";
import BookingSchema from "./booking.schema";

export const BookingModel = model<IBookingDocument>("booking", BookingSchema);
