import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService } from '../services/comment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Inject AuthService to get the user ID
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserLocationMapComponent } from '../user-location-map/user-location-map.component'; 


@Component({
  selector: 'app-post-detail',
  standalone: true,
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  imports: [RouterModule, HttpClientModule, CommonModule, UserLocationMapComponent],
  
})
export class PostDetailComponent implements OnInit {
  postId!: number;
  post: any;
  userId!: number | null;  
  liked: boolean = false;
  latitude!: number;
  longitude!: number;
  userNames: { [key: number]: string } = {};

  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
    
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
      this.fetchPostDetails();
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
      this.likeService.removeLike(likeData).subscribe(
        () => {
          this.liked = false;
          if (this.post?.likesCount !== undefined) {
            this.post.likesCount -= 1; // Smanjite broj lajkova
          }
        },
        (error) => {
          console.error('Error removing like:', error);
        }
      );
    } else {
      this.likeService.addLike(likeData).subscribe(
        () => {
          this.liked = true;
          if (this.post?.likesCount !== undefined) {
            this.post.likesCount += 1; // Povećajte broj lajkova
          }
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
  
  fetchPostDetails(): void {
    this.postService.getPostById(this.postId).subscribe((data) => {
      this.post = data;
      if (this.post && this.post.location) {
        this.latitude = this.post.location.lat;
        this.longitude = this.post.location.lng;
      }
      this.loadUsernamesForComments();
    });
  }

  loadUsernamesForComments(): void {
    // Create an array of promises for loading usernames for each comment
    const usernamePromises = this.post.comments.map((comment: any) => 
      this.loadUsernameForComment(comment.userId)
    );
    
    // Wait for all usernames to be loaded
    Promise.all(usernamePromises).then(() => {
      // After all usernames are loaded, you can safely render the comments
      console.log('All usernames are loaded:', this.userNames);
    });
  }
  loadUsernameForComment(userId: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.userNames[userId]) {
        this.authService.getUserById(userId).subscribe((user) => {
          this.userNames[userId] = user.name;
          resolve();
        });
      } else {
        resolve();
      }
    });

  }
  editPost() {
    if (this.userId !== this.post.userId) {
      alert('You do not have permission to edit this post.');
      return;
    }
    console.log('Editing post:', this.post.id);
    this.router.navigate(['/edit-post', this.post.id]);
  }
  
  deletePost() {
    if (this.userId !== this.post.userId) {
      alert('You do not have permission to delete this post.');
      return;
    }
  
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.post.id).subscribe(() => {
        console.log('Post deleted');
        this.router.navigate(['/posts']);
      });
    }
  }
  
  
}
