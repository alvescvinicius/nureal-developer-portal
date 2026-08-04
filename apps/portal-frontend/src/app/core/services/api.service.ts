import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiDetail,
  ApiSummary,
  TryApiRequestPayload,
  TryApiResponsePayload,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = '/api/apis';

  constructor(private readonly http: HttpClient) {}

  listApis(): Observable<ApiSummary[]> {
    return this.http.get<ApiSummary[]>(this.baseUrl);
  }

  getApiDetail(slug: string): Observable<ApiDetail> {
    return this.http.get<ApiDetail>(`${this.baseUrl}/${slug}`);
  }

  getDocContent(slug: string, fileName: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/${slug}/docs/${fileName}`, {
      responseType: 'text',
    });
  }

  tryApi(slug: string, payload: TryApiRequestPayload): Observable<TryApiResponsePayload> {
    return this.http.post<TryApiResponsePayload>(`${this.baseUrl}/${slug}/try`, payload);
  }
}
