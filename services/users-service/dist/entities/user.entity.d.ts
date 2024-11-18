export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    isEmailVerified: boolean;
    googleId?: string;
    facebookId?: string;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
