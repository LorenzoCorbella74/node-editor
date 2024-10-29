import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren, type OnInit } from '@angular/core';

@Component({
  selector: 'app-node',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeComponent implements OnInit {

  @Input() id!: string;
  @Input() x!: number;
  @Input() y!: number;
  private _numberInputs!: number;
  private _numberOutputs!: number;
  inputs!: number[];
  outputs!: number[];

  @Input()
  get numberInputs(): number {
    return this._numberInputs;
  }
  set numberInputs(value: number) {
    this._numberInputs = value;
    this.inputs = Array.from({ length: value }, (_, i) => i);
  }

  @Input()
  get numberOutputs(): number {
    return this._numberOutputs;
  }
  set numberOutputs(value: number) {
    this._numberOutputs = value;
    this.outputs = Array.from({ length: value }, (_, i) => i);
    // Add any additional logic for the setter here if needed
  }
  @Input() selected!: boolean;

  @Output() onMouseDown = new EventEmitter<{ id: string, event: any }>(); // quando l'utente clicca sul nodo
  @Output() onMouseDownOutput = new EventEmitter<{ outputPositionX: number, outputPositionY: number, nodeId: string, outputIndex: number }>(); // quando l'utente clicca su un output del nodo
  @Output() onMouseEnterInput = new EventEmitter<{ inputPositionX: number, inputPositionY: number, nodeId: string, inputIndex: number }>(); // quando l'utente clicca su un input del nodo
  @Output() onMouseLeaveInput = new EventEmitter<{ nodeId: string, inputIndex: number }>(); // quando l'utente clicca su un input del nodo

/*   @ViewChildren("elReference") elReference!: QueryList<ElementRef>;

  ngAfterViewInit() {
    this.elReference.toArray()
  } */

  ngOnInit(): void { }

  onMouseDownHandler(event: any) {
    this.onMouseDown.emit({ id: this.id, event: event });
  }

  onMouseEnterInputHandler(event: any, inputIndex: number) {
    let centerX = event.target.getBoundingClientRect().left + Math.abs(event.target.getBoundingClientRect().right - event.target.getBoundingClientRect().left) / 2;
    let centerY = event.target.getBoundingClientRect().top + Math.abs(event.target.getBoundingClientRect().bottom - event.target.getBoundingClientRect().top) / 2;

    this.onMouseEnterInput.emit({
      inputPositionX: centerX,
      inputPositionY: centerY,
      nodeId: this.id,
      inputIndex: inputIndex
    });
  }

  onMouseLeaveInputHandler(event: any, inputIndex: number) {
    this.onMouseLeaveInput.emit({ nodeId: this.id, inputIndex: inputIndex });
  }

  onMouseDownOutputHandler(event: any, outputIndex: number) {
    let centerX = event.target.getBoundingClientRect().left + Math.abs(event.target.getBoundingClientRect().right - event.target.getBoundingClientRect().left) / 2;
    let centerY = event.target.getBoundingClientRect().top + Math.abs(event.target.getBoundingClientRect().bottom - event.target.getBoundingClientRect().top) / 2;

    this.onMouseDownOutput.emit({
      outputPositionX: centerX,
      outputPositionY: centerY,
      nodeId: this.id,
      outputIndex: outputIndex
    });
  }

}
