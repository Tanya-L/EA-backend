
import { Module, ModuleComponent } from '@liftr/core';
import { bookingRoute } from './booking.routes';

export const BookingModule: ModuleComponent = Module([
    {
        route: bookingRoute,
        middleware: [],
    },
])
