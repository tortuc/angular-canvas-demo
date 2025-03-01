import { Component } from '@angular/core';
import { CanvasComponent } from './canvas.component';

@Component({
  selector: 'app-root',
  imports: [CanvasComponent],
  template: `
    <app-canvas />
  `,
  styles: [],
})
export class AppComponent {
}
