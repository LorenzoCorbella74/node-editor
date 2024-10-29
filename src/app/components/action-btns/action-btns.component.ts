import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, Renderer2, signal, ViewChild, WritableSignal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-btns',
  standalone: true,
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './action-btns.component.html',
  styleUrl: './action-btns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBtnsComponent implements OnInit {

  @Input() showDelete!: boolean;

  numOutputs: number = 0;
  numInputs: number = 0;

  @Output() onDelete = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<{ numberInputs: number, numberOutputs: number }>();

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('btn_dropdown') trigger!: ElementRef;

  isOpen = signal(false);

  constructor(public renderer: Renderer2, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    /* this.renderer.listen('window', 'click', (e: Event) => {
      if (e.target != this.trigger.nativeElement && !this.dropdown.nativeElement.contains(e.target)) {
        this.isOpen.set(false)
        this.cd.detectChanges();
      }
    }); */

  }

  openDropDown() {
    this.isOpen.set(true);
  }

  erase() {
    this.onDelete.emit();
  }

  add() {
    if (this.numInputs > 0 || this.numInputs < 5 || this.numOutputs > 0 || this.numOutputs < 5) {
      this.isOpen.set(false);
      this.onAdd.emit({ numberInputs: this.numInputs, numberOutputs: this.numOutputs });
      this.numInputs = 0;
      this.numOutputs = 0;
    }
  }

}
