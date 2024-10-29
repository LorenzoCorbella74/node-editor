import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, input, Input, Output, type OnInit } from '@angular/core';

@Component({
  selector: 'app-edge',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './edge.component.html',
  styleUrl: './edge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdgeComponent implements OnInit {

  @Input() isNew!: boolean;
  @Input() selected!: boolean;
  position = input({ x0: 0, y0: 0, x1: 0, y1: 0 });

  path = computed(() => {
    let p = this.position();
    let midPoint1 = p.x0 + Math.abs(p.x1 - p.x0);
    let midPoint2 = p.x1 - Math.abs(p.x1 - p.x0);
    let path = `M ${p.x0} ${p.y0} C ${midPoint1} ${p.y0}, ${midPoint2} ${p.y1}, ${p.x1} ${p.y1}`;
    return path;
  });

  middlePoint = computed(() => {
    let p = this.position();
    return { x: p.x0 + (p.x1 - p.x0) / 2, y: p.y1 - (p.y1 - p.y0) / 2 };
  })

  transformation = computed(() => {
    return `translate(${this.middlePoint().x}px, ${this.middlePoint().y - (this.selected?24:0)}px)`;
  });

  @Output() onMouseDownEdge = new EventEmitter<{ event: any }>(); // quando l'utente clicca sul nodo
  @Output() onClickDelete = new EventEmitter<{ event: any }>(); // quando l'utente clicca sul nodo

  ngOnInit(): void {

  }


  onMouseDownHandler(event: any) {
    // event.stopPropagation();
    this.onMouseDownEdge.emit({ event: event });
  }

  onMouseDownDelete(event: any) {
    // event.stopPropagation();
    this.onClickDelete.emit({ event: event });
  }

}
