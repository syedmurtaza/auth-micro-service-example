import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../entities/user.entity").User>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
}
