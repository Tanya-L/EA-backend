import {Module, ModuleComponent} from '@liftr/core';
import {adminBookingRoute, bookingRoute} from './booking.routes';

export const BookingModule: ModuleComponent = Module([
    {
        route: bookingRoute,
        middleware: [],
    },
    {
        route: adminBookingRoute,
        middleware: [],
    },
]);
