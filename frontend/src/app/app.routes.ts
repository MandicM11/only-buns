import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { AuthGuard } from './guards/auth.guards';
import { PostCreateComponent } from './post-create/post-create.component';
import { HomeComponent } from './home/home.component';
import { FollowedPostsComponent } from './followed-posts/followed-posts.component';
import { TrendsComponent } from './trends/trends.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { PostEditComponent } from './post-edit/post-edit.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  //{ path: '', redirectTo: '/posts', pathMatch: 'full' },  // Redirektovanje na login
  { path: 'activate/:token', component: ActivateAccountComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/:id', component: PostDetailComponent},
  { path: 'create-post', component: PostCreateComponent,canActivate: [AuthGuard]  },
  { path: 'home', component: HomeComponent },
  { path: 'posts/followed', component: FollowedPostsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'edit-post/:id', component: PostEditComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
