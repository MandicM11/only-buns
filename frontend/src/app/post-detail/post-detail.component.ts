import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService } from '../services/comment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Inject AuthService to get the user ID
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  templateUrl: './post-detail.component.html',
  imports: [RouterModule, HttpClientModule, CommonModule],
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  postId!: number;
  post: any;
  userId!: number | null;  // Store the logged-in user ID, can be null if not authenticated
  liked: boolean = false;

  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private authService: AuthService  // Inject AuthService
  ) {}

  ngOnInit(): void {
    // Retrieve postId from the URL parameters
    this.route.paramMap.subscribe((params) => {
      this.postId = +params.get('id')!;  // '+' converts the string 'id' to a number

      // Fetch the post details using the postId
      this.postService.getPostById(this.postId).subscribe((data) => {
        this.post = data;
      });

      // Fetch the logged-in user ID from AuthService
      this.userId = this.authService.getUserId();
      console.log('User ID is: ', this.userId);

      // Check if the user has already liked the post
      this.checkIfLiked();
    });
  }

  checkIfLiked(): void {
    // Fetch likes for the post and check if the current user has liked it
    this.likeService.getLikesForPost(this.postId).subscribe((likes) => {
      const userLiked = likes.some((like: any) => like.userId === this.userId);
      this.liked = userLiked;  // Set the liked status based on the response
    });
  }

  toggleLike(): void {
    if (!this.userId) {
      alert('User is not logged in!');
      return;
    }

    const likeData = { postId: this.postId, userId: this.userId };

    if (this.liked) {
      // Remove like (dislike)
      this.likeService.removeLike(likeData).subscribe(
        (response) => {
          this.liked = false;  // User disliked the post
          this.post.likes -= 1;  // Decrement the like count
        },
        (error) => {
          console.error('Error removing like:', error);
        }
      );
    } else {
      // Add like
      this.likeService.addLike(likeData).subscribe(
        (response) => {
          this.liked = true;  // User liked the post
          this.post.likes += 1;  // Increment the like count
        },
        (error) => {
          console.error('Error adding like:', error);
        }
      );
    }
  }

  addComment(commentContent: string): void {
    if (!this.userId) {
      alert('User is not logged in!');
      return;
    }
    
    console.log('User ID is: ', this.userId);
    
    const commentData = { content: commentContent, postId: this.postId, userId: this.userId };
    this.commentService.addComment(commentData).subscribe((response) => {
      // Assuming response contains the new comment object
      if (this.post && response) {
        this.post.comments.push(response);  // Add the new comment to the post
      }
    }, (error) => {
      console.error('Error adding comment:', error);
    });
  }
}
