import { Observable } from 'rxjs';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';

export class Token {
    expires_in: number;
    access_token: string;
    refresh_token: string;
}