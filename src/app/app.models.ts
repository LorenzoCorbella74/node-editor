import { WritableSignal } from "@angular/core";

export type Node = {
  id: string;
  numberInputs: number;
  numberOutputs: number;
  prevPosition: WritableSignal<{ x: number, y: number }>;
  currentPosition:  WritableSignal<{ x: number, y: number }>;
  inputEdgeIds: WritableSignal<string[]>;  // lista degli id degli edge in input
  outputEdgeIds: WritableSignal<string[]>; // lista degli id degli edge in output
}

export type Edge = {
  id:string;
  nodeStartId: string; // id del nodo di partenza
  nodeEndId: string;  // id del nodo di arrivo
  inputIndex: number; // indice dell'input del nodo di partenza
  outputIndex: number; // indice dell'output del nodo di arrivo
  prevStartPosition:WritableSignal< { x: number, y: number }>; // posizione iniziale del nodo di partenza
  prevEndPosition: WritableSignal<{ x: number, y: number }>; // posizione iniziale del nodo di arrivo
  currStartPosition: WritableSignal<{ x: number, y: number }>; // posizione attuale del nodo di partenza
  currEndPosition: WritableSignal<{ x: number, y: number }>; // posizione attuale del nodo di arrivo
}