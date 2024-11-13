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
  
  }

