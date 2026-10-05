import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recipe, RecipeInput } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private baseUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  /** Lista las recetas de todos los usuarios */
  list(includeInactive = false): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.baseUrl, {
      params: { include_inactive: includeInactive },
    });
  }

  get(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  create(payload: RecipeInput): Observable<Recipe> {
    return this.http.post<Recipe>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<RecipeInput>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.baseUrl}/${id}`, payload);
  }

  /** Baja lógica: la receta se desactiva, no se borra físicamente */
  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivate(id: string): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/${id}/reactivate`, {});
  }
}
