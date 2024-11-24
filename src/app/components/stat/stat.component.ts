import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat',
  standalone: true,
  imports: [],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.scss',
})
export class StatComponent {
  @Input() label: string = '';
  @Input() value: number = 0;
}
