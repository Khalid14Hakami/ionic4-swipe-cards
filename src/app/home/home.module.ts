import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SwingModule } from 'angular2-swing';
import { HomePage } from './home.page';
import { SwipeCardComponent } from './swipe-card/swipe-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    SwingModule
  ],
  declarations: [HomePage, SwipeCardComponent]
})
export class HomePageModule {}
