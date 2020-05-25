import {AppRouter} from '@liftr/core';
import {BookingModule} from '@routes/booking/booking.module';
import {LiftrModule} from './liftr.module';
import {SessionModule} from "@routes/session/session.module";

export const routes: AppRouter[] = [

    {
        path: '/booking',
        module: BookingModule,
        middleware: [],
    }, {
        path: '/session',
        module: SessionModule,
        middleware: [],
    }, {
        path: '/',
        module: LiftrModule,
        middleware: [],
    },
];
