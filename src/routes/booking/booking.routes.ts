import {Route} from '@liftr/core';
import {
    adminBookingGetController,
    bookingGetController
} from '@controllers/booking/bookingGetController';

export const bookingRoute = Route.get('/', bookingGetController);
export const adminBookingRoute = Route.get('/admin', adminBookingGetController);
