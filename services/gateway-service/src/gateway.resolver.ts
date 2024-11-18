import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Resolver()
export class GatewayResolver {
    constructor(
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
        @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    ) { }

    // @Query()
    // async mean(@Args('numbers') numbers: number[]) {
    //     return this.authClient.send({ cmd: 'calculateMean' }, numbers);
    // }

    // @Mutation()
    // async movingAverage(@Args('series') series: number[], @Args('windowSize') windowSize: number) {
    //     return this.usersClient.send({ cmd: 'calculateMovingAverage' }, { series, windowSize });
    // }
}