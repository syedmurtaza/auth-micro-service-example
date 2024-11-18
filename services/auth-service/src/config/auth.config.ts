import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
    },
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.AUTH_CALLBACK_URL + '/google/callback',
    },
    facebook: {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.AUTH_CALLBACK_URL + '/facebook/callback',
    },
}));