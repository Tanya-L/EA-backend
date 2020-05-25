
import { Route } from '@liftr/core';
import { bookingController } from '@controllers/booking/booking.controller';

export const bookingRoute = Route.get('/', bookingController);
