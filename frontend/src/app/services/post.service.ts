import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getPostById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPost(postData: any): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updatePost(postData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${postData.id}`, postData);
  }

  getPosts(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts => {
        // Sort posts by createdAt field (ascending or descending)
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      })
    );
  }

  getPostsInRadius(userLat: number, userLng: number, radiusKm: number = 1000): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/withinBounds?userLat=${userLat}&userLng=${userLng}&radiusKm=${radiusKm}`);
  }

  promotePost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/promote`, {});
  }
 


}


  


