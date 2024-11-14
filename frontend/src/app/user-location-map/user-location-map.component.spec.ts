import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocationMapComponent } from './user-location-map.component';

describe('UserLocationMapComponent', () => {
  let component: UserLocationMapComponent;
  let fixture: ComponentFixture<UserLocationMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLocationMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLocationMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
