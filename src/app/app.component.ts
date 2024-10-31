import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, WritableSignal } from '@angular/core';
import { Edge, Node } from './app.models';
import { ActionBtnsComponent } from './components/action-btns/action-btns.component';
import { NodeComponent } from './components/node/node.component';
import { EdgeComponent } from './components/edge/edge.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ActionBtnsComponent, NodeComponent, EdgeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AppComponent {


  limitmousemove = 0;

  isGrabbing = signal(false);
  scale = signal(1);
  clickPosition = signal({ x: -1, y: -1 });
  board: any;

  showDelete = computed(() => this.selectedNode() !== null);

  selectedNode: WritableSignal<string | null> = signal(null); // id del nodo selezionato
  nodes: WritableSignal<Node[]> = signal([])

  tempEdge: WritableSignal<Edge | null> = signal(null);
  edges: WritableSignal<Edge[]> = signal([]);
  selectedEdge: WritableSignal<string | null> = signal(null); // id dell'edge selezionato

  insideInput: WritableSignal<{ nodeId: string, inputIndex: number, positionX: number, positionY: number } | null> = signal(null);

  onMouseDownBoard(event: any) {

    if (event.target.id === "board" && !this.isGrabbing()) {
      // deselect node
      this.selectedNode.set(null);
      // deselect edge
      this.selectedEdge.set(null);
    };

    // start grabbing board
    this.isGrabbing.set(true);
    this.clickPosition.set({ x: event.x, y: event.y });
  }

  onMouseUpBoard(event: any) {
    this.clickPosition.set({ x: -1, y: -1 });

    // stop grabbing board
    this.isGrabbing.set(false);

    // se un nuovo nodo  stato settato e non stato collegato a nessun input
    if (this.tempEdge() !== null && this.insideInput() === null) {
      this.tempEdge.set(null);
    }

    if (this.tempEdge() !== null && this.insideInput() !== null) {

      const nodeStartId = this.tempEdge()!.nodeStartId;
      const nodeEndId = this.insideInput()!.nodeId;

      const nodeStart = this.nodes().find(n => n.id === nodeStartId);
      const nodeEnd = this.nodes().find(n => n.id === nodeEndId);
      const boardWrapper = document.getElementById('boardWrapper');

      if (nodeStart && nodeEnd && boardWrapper) {
        let id = `edge_${nodeStart.id}_${this.tempEdge()?.outputIndex}_${nodeEnd.id}_${this.insideInput()!.inputIndex}`;

        // si aggiornano gli id
        nodeStart.outputEdgeIds.update((prev) => [...prev, id]);
        nodeEnd.inputEdgeIds.update((prev) => [...prev, id]);

        this.tempEdge()?.prevStartPosition.set({
          x: (this.tempEdge()!.currStartPosition().x * this.scale() + boardWrapper.scrollLeft) / this.scale(),
          y: (this.tempEdge()!.currStartPosition().y * this.scale() + boardWrapper.scrollTop) / this.scale()
        });

        // si aggiorna la previuo
        this.tempEdge()?.prevEndPosition.set({
          x: (this.insideInput()!.positionX + boardWrapper.scrollLeft) / this.scale(),
          y: (this.insideInput()!.positionY + boardWrapper.scrollTop) / this.scale()
        });

        this.tempEdge()?.currEndPosition.set({
          x: (this.insideInput()!.positionX + boardWrapper.scrollLeft) / this.scale(),
          y: (this.insideInput()!.positionY + boardWrapper.scrollTop) / this.scale()
        });

        // si aggiunge il nuovo edge
        this.edges.update((prev) => [...prev, {
          ...this.tempEdge()!,
          id,
          nodeStartId: nodeStart.id,
          nodeEndId: nodeEnd.id,
          nodeEndInputIndex: this.insideInput()!.inputIndex
        }]);

        // si resetta il nuovo edge
        this.tempEdge.set(null);

      }
    }
  }

  onMouseMove(event: any) {
    // HACK TO MAKE ANGULAR PEROFORMANT on SVG :-)
    this.limitmousemove++;
    if (this.limitmousemove % 2 !== 0) {
      return;
    }

    // user is setting new edge
    if (this.tempEdge() !== null) {
      const boardWrapper = document.getElementById('boardWrapper');
      if (boardWrapper) {
        this.tempEdge.update((edge) => {
          let s = this.scale();
          edge!.currEndPosition.set({
            x: (event.x + boardWrapper!.scrollLeft) / s,
            y: (event.y + boardWrapper!.scrollTop) / s
          });
          return edge;
        });
      }
    } else {
      // se l'utente ha cliccato e sta trascinando
      let { x, y } = this.clickPosition();
      if (x >= 0 && y >= 0) {
        let dx = event.x - x;
        let dy = event.y - y;

        if (this.selectedNode() !== null) {
          // user clicked on node
          const node = this.nodes().find(n => n.id === this.selectedNode());
          if (node) {
            // update node position
            node.currentPosition.set({
              x: (node.prevPosition().x + dx) / this.scale(),
              y: (node.prevPosition().y + dy) / this.scale()
            });

            // update input edges position
            node.inputEdgeIds().forEach((edgeId) => {
              const edge = this.edges().find(e => e.id === edgeId);
              if (edge) {
                edge.currEndPosition.set({
                  x: (edge.prevEndPosition().x + dx) / this.scale(),
                  y: (edge.prevEndPosition().y + dy) / this.scale()
                });
              }
            });

            // update output edges position
            node.outputEdgeIds().forEach((edgeId) => {
              const edge = this.edges().find(e => e.id === edgeId);
              if (edge) {
                edge.currStartPosition.set({
                  x: (edge.prevStartPosition().x + dx) / this.scale(),
                  y: (edge.prevStartPosition().y + dy) / this.scale()
                });
              }
            });
          }

        } else {
          // click sul canvas
          let boardWrapper = document.getElementById('boardWrapper');
          if (boardWrapper) {
            boardWrapper.scrollBy(-dx, -dy);
            this.clickPosition.set({ x: event.x, y: event.y });
          }
        }
      }

    }
  }

  ngOnInit() {
    this.board = document.getElementById('board');
    if (this.board) {
      this.board.addEventListener('wheel', this.manageBoard.bind(this));
    }
  }


  private manageBoard(event: any) {
    // update scale on mouse wheel
    this.scale.update((prev) => prev + event.deltaY * -0.0005);

    // restrict scale between 1 and 2
    this.scale.update((scale) => Math.min(Math.max(1, scale), 2));

    // apply scale transform
    this.board.style.transform = `scale(${this.scale()})`;
    this.board.style.marginTop = `${(this.scale() - 1) * 50}px`;
    this.board.style.marginLeft = `${(this.scale() - 1) * 50}px`;
  }

  /* ------------------ NODE EVENTS ------------------ */

  onDelete() {
    const node = this.nodes().find(n => n.id === this.selectedNode());
    if (node) {
      this.nodes.update((prev) => prev.filter(n => n.id !== this.selectedNode()));
      this.selectedNode.set(null);

      // remove input edges
      this.edges.update((prev) => prev.filter(e => e.nodeStartId !== node.id && e.nodeEndId !== node.id));
    } else {
      this.selectedNode.set(null);
    }
  }

  onAdd({ numberInputs, numberOutputs }: { numberInputs: number, numberOutputs: number }) {
    const randomId = Math.random().toString(36).substring(2, 8);
    const randX = 0.5 * window.innerWidth;
    const randY = 0.5 * window.innerHeight;
    const newNode = {
      id: randomId,
      numberInputs,
      numberOutputs,
      prevPosition: signal({ x: randX, y: randY }),
      currentPosition: signal({ x: randX, y: randY }),
      inputEdgeIds: signal([]),
      outputEdgeIds: signal([])
    }
    this.nodes.update((prev) => [...prev, newNode]);
  }

  onMouseDownNodeHandler(id: string, event: any) {
    // deselect edge
    this.selectedEdge.set(null);

    // select node
    this.selectedNode.set(id);
    // update user click position
    this.clickPosition.set({ x: event.x, y: event.y });

    const node = this.nodes().find(n => n.id === this.selectedNode());
    if (node) {
      node.prevPosition.set({ 
        x: node.currentPosition().x * this.scale(), 
        y: node.currentPosition().y * this.scale() 
      });

      // update input edges position
      node.inputEdgeIds().forEach((edgeId) => {
        const edge = this.edges().find(e => e.id === edgeId);
        if (edge) {
          edge.prevEndPosition.set({
            x: edge.currEndPosition().x * this.scale(),
            y: edge.currEndPosition().y * this.scale()
          });
        }
      });

      // update output edges position
      node.outputEdgeIds().forEach((edgeId) => {
        const edge = this.edges().find(e => e.id === edgeId);
        if (edge) {
          edge.prevStartPosition.set({
            x: edge.currStartPosition().x * this.scale(),
            y: edge.currStartPosition().y * this.scale()
          });
        }
      });
    }
  }

  /* ------------------ EDGE EVENTS ------------------ */

  onMouseDownOutputHandler(event: { outputPositionX: number, outputPositionY: number, nodeId: string, outputIndex: number }) {
    // deselect node
    this.selectedNode.set(null);

    const b = document.getElementById('boardWrapper');
    if (b !== null) {
      let s = this.scale();
      // create new edge
      this.tempEdge.set({
        id: '',
        nodeStartId: event.nodeId,
        outputIndex: event.outputIndex,
        nodeEndId: '',
        inputIndex: -1,
        prevStartPosition: signal({ x: (event.outputPositionX + b?.scrollLeft) / s, y: (event.outputPositionY + b.scrollTop) / s }),
        prevEndPosition: signal({ x: (event.outputPositionX + b?.scrollLeft) / s, y: (event.outputPositionY + b.scrollTop) / s }),
        currStartPosition: signal({ x: (event.outputPositionX + b?.scrollLeft) / s, y: (event.outputPositionY + b.scrollTop) / s }),
        currEndPosition: signal({ x: (event.outputPositionX + b?.scrollLeft) / s, y: (event.outputPositionY + b.scrollTop) / s })
      });
    }
  }

  onMouseEnterInputHandler(event: { inputPositionX: number, inputPositionY: number, nodeId: string, inputIndex: number }) {
    this.insideInput.set({ nodeId: event.nodeId, inputIndex: event.inputIndex, positionX: event.inputPositionX, positionY: event.inputPositionY });
  }

  onMouseLeaveInputHandler(event: { nodeId: string, inputIndex: number }) {
    if (this.insideInput() !== null) {
      if (this.insideInput()!.nodeId === event.nodeId && this.insideInput()!.inputIndex === event.inputIndex) {
        this.insideInput.set(null);
      }
    }
  }

  onMouseDownEdgeHandler(id: string) {
    // deselect node
    this.selectedNode.set(null);

    // select edge
    this.selectedEdge.set(id);
  }

  onClickDeleteEdgeHandler(id: string) {
    const edge = this.edges().find(e => e.id === id);
    if (edge) {
      const nodeStart = this.nodes().find(n => n.id === edge.nodeStartId);
      const nodeEnd = this.nodes().find(n => n.id === edge.nodeEndId);
      if (nodeStart && nodeEnd) {
        nodeStart.outputEdgeIds.update((prev) => prev.filter(e => e !== id));
        nodeEnd.inputEdgeIds.update((prev) => prev.filter(e => e !== id));
      }
      this.edges.update((prev) => prev.filter(e => e.id !== id));
    }
  }

  ngOnDestroy() {
    this.board.removeEventListener('wheel', this.manageBoard.bind(this));
  }

}




/* 


https://stackblitz.com/edit/angular-css-transform?file=src%2Fapp%2Fapp.component.html 

https://stackoverflow.com/questions/60052468/very-large-nested-array-ngfor-svg-rendering-performance-issues-architecture-que



*/
