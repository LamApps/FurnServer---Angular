import { Observable } from 'rxjs';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { Token } from './token';

export class AuthResult {
    result: boolean;
    token: Token;
}