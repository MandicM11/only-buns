import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { AuthGuard } from './guards/auth.guards';
import { PostCreateComponent } from './post-create/post-create.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/posts', pathMatch: 'full' },  // Redirektovanje na login
  { path: 'activate/:token', component: ActivateAccountComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/:id', component: PostDetailComponent},
  { path: 'create-post', component: PostCreateComponent,canActivate: [AuthGuard]  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
