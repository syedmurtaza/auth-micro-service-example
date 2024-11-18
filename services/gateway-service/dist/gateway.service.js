"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const microservices_1 = require("@nestjs/microservices");
const class_validator_1 = require("class-validator");
let GatewayService = GatewayService_1 = class GatewayService {
    constructor(authClient, usersClient) {
        this.authClient = authClient;
        this.usersClient = usersClient;
        this.logger = new common_1.Logger(GatewayService_1.name, { timestamp: true });
    }
    async login(userObj) {
        const user = await (0, rxjs_1.firstValueFrom)(this.usersClient.send({ cmd: 'getUserByEmail' }, userObj.email).pipe((0, operators_1.timeout)(5000), (0, operators_1.retry)(3), (0, rxjs_1.catchError)(err => {
            if (err.name === 'TimeoutError') {
                this.logger.error('Timeout while fetching user from Users Service');
                throw new Error('Service timeout');
            }
            this.logger.error('Error fetching user from Users Service', err);
            throw new Error(err.message || 'User not found');
        })));
        if ((0, class_validator_1.IsObject)(user) && user !== null && user !== undefined) {
            const isValidToken = await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'validateUser' }, { user, password: userObj.password }).pipe((0, rxjs_1.catchError)(err => {
                this.logger.error('Error validating user with Auth Service', err);
                throw new Error('Validation failed');
            })));
            return isValidToken;
        }
        else {
            this.logger.error('User not found...');
            return 'User not found...';
        }
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = GatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __param(1, (0, common_1.Inject)('USERS_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        microservices_1.ClientProxy])
], GatewayService);
//# sourceMappingURL=gateway.service.js.map