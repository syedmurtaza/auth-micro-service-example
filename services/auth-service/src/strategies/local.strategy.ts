
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    //async validate(email: string, password: string): Promise<any> {
    async validate(payload: any) {
        // Extract email and password from the message payload
        const { email, password } = payload;
        const user = await this.authService.validateUP(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}