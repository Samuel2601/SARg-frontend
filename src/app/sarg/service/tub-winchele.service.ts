import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

export interface TubWinchele {
	id: number;
	geom: string | null;
	fid: string | null;
	entity: string | null;
	layer: string | null;
	color: number | null;
	linetype: string | null;
	elevation: number | null;
	linewt: number | null;
	refname: string | null;
	nivel: string | null;
	e22: string | null;
	diametro: string | null;
	tanque: string | null;
	canton: string | null;
}

@Injectable({
	providedIn: 'root',
})
export class TubWincheleService {
	private apiUrl = `${environment.apiUrl}/tub-winchele`; // URL de tu API

	constructor(private http: HttpClient) {}

	findAll(page: number = 1, limit: number = 10, filter?: string, search?: string, fields?: string): Observable<TubWinchele[]> {
		let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

		if (filter) {
			params = params.set('filter', filter);
		}
		if (search) {
			params = params.set('search', search);
		}
		if (fields) {
			params = params.set('fields', fields);
		}

		return this.http.get<TubWinchele[]>(this.apiUrl, {params});
	}
}
