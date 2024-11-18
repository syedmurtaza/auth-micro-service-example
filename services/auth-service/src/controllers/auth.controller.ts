import { Controller, Get, Post, UseGuards, Req, UnauthorizedException, Logger } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { FacebookAuthGuard } from '../guards/facebook-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LocalStrategy } from '../strategies/local.strategy';

@Controller('api/v1/auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name, { timestamp: true });

    constructor(private authService: AuthService) { }

    @Get('auth/google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() { }

    // @Get('auth/google/callback')
    // @UseGuards(GoogleAuthGuard)
    // async googleAuthCallback(@Req() req) {
    //     return this.authService.login(req.user);
    // }

    @Get('auth/facebook')
    @UseGuards(FacebookAuthGuard)
    async facebookAuth() { }

    // @Get('facebook/callback')
    // @UseGuards(FacebookAuthGuard)
    // async facebookAuthCallback(@Req() req) {
    //     return this.authService.login(req.user);
    // }


    @MessagePattern({ cmd: 'validateUser' })
    async login(@Payload() data: { user: Object, password: string }) {
        //return await this.authService.login(data.user, data.password);
        try {
            const access_token = await this.authService.login(data.user, data.password);
            if (!access_token) {
                throw new UnauthorizedException('Invalid credentials');
            }
            return access_token;
        } catch (error) {
            this.logger.error(`User could not be validated : ${error.message}`);
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('auth/logout')
    async logout(@Req() req) {
        return req.logout();
    }
}