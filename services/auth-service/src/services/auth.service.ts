import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
//import { HttpService } from '@nestjs/axios';
//import { AxiosError } from 'axios';
//import { catchError, firstValueFrom } from 'rxjs';

//TODO: https://docs.nestjs.com/security/authentication

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name, { timestamp: true });

    constructor(
        //private readonly httpService: HttpService,
        private jwtService: JwtService,

    ) { }

    // private async findByEmail(email: string): Promise<any> {
    //     const { data } = await firstValueFrom(
    //         this.httpService.post<any>('http://localhost:8878/v1/validate-user/email', { 'email': email }).pipe(
    //             catchError((error: AxiosError) => {
    //                 this.logger.error(error.response.data);
    //                 throw 'An error happened!';
    //             }),
    //         ),
    //     );
    //     return data;
    // }


    validateUP(email: string, pass: string): any | false {
        // Need to call Usres' Service and then validate against username and password
        // if (username && password === pass) {
        //     const { password, ...result } = user;
        //     return result;
        // }
        return false;
    }

    private validateUser(user: Record<string, any>, pass: string): Omit<Record<string, any>, 'password'> | false {
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return false;
    }

    async login(userObj: Record<string, any>, pass: string): Promise<{ access_token: string }> {
        const user = this.validateUser(userObj, pass);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
