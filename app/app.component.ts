import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  options = {
    position: ['bottom', 'center'],
    timeOut: 3000,
    showProgressBar: false,
    animate: 'fromBottom'
  };
  title = 'Two Factor Demo';
}
