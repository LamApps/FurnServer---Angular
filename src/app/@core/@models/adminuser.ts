import { User } from './user';
export class Adminuser extends User {
    token: string;
    id: string;
    role: string;
    firstname: string;
    lastname: string;
    login: string;
    email: string;
    username: string;
    photo: string;
    mobile: string;
    position: string;
    birthday: Date;
}