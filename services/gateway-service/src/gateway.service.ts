import { Injectable, Logger, Inject } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { ClientProxy } from '@nestjs/microservices';
import { IsObject } from 'class-validator';

@Injectable()
export class GatewayService {
    private readonly logger = new Logger(GatewayService.name, { timestamp: true });

    constructor(
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
        @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    ) { }


    async login(userObj: any) {

        //Get the Users API to get the user by Email.
        //Pass the details to the Auth Service to validate the User.
        const user = await firstValueFrom(this.usersClient.send({ cmd: 'getUserByEmail' }, userObj.email).pipe(
            timeout(5000), // 5 seconds timeout
            retry(3),      // retry 3 times
            catchError(err => {
                if (err.name === 'TimeoutError') {
                    this.logger.error('Timeout while fetching user from Users Service');
                    throw new Error('Service timeout');
                }
                this.logger.error('Error fetching user from Users Service', err);
                throw new Error(err.message || 'User not found');
            })
        ));


        if (IsObject(user) && user !== null && user !== undefined) {

            const isValidToken = await firstValueFrom(this.authClient.send({ cmd: 'validateUser' }, { user, password: userObj.password }).pipe(
                catchError(err => {
                    this.logger.error('Error validating user with Auth Service', err);
                    throw new Error('Validation failed');
                })
            ));

            return isValidToken;
        } else {
            this.logger.error('User not found...');
            return 'User not found...';
        }
    }
}
