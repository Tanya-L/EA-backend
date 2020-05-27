export interface Booking {
    isActive: boolean,
    name: string,
    phone: string,
    comments: string,
    bookingCode: string,
}

export class BookingImpl implements Booking {
    constructor(
        public isActive: boolean,
        public name: string,
        public phone: string,
        public comments: string,
        public bookingCode: string
    ) {
    }
}
