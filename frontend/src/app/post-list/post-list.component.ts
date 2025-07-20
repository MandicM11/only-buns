import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { HttpClientModule } from '@angular/common/http';
import { PostService } from '../services/post.service'; // Import PostService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule], // Include RouterModule and HttpClientModule
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: any[] = []; // Array to store posts

  constructor(private postService: PostService) {} // Inject PostService

  ngOnInit(): void {
    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response;
        console.log('Posts loaded:', this.posts);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  promotePost(postId: number): void {
    this.postService.promotePost(postId).subscribe({
      next: (response) => {
        console.log('Post promoted successfully:', response);
        // Osvežavamo listu postova da prikažemo novi status
        this.loadPosts();
        alert('Post successfully promoted!');
      },
      error: (error) => {
        console.error('Error promoting post:', error);
        alert('Error promoting post. Please try again.');
      }
    });
  }

  private loadPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }
  
  }

