// activate-account.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html'
})
export class ActivateAccountComponent implements OnInit {
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.activateAccount(token).subscribe({
        next: (response) => {
          this.message = response.message;
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirect to login after a delay
          }, 3000);
        },
        error: (error) => {
          this.message = error.error.message || 'Activation failed. The link may be invalid or expired.';
        }
      });
    }
  }
}
