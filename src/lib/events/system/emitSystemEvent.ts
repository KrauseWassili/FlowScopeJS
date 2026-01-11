import { SystemEvent } from "./systemEvent.type";

type Listener = (event: SystemEvent) => void;

const listeners: Listener[] = [];

export function emitSystemEvent(event: SystemEvent) {
  listeners.forEach((fn) => fn(event));
}

export function onSystemEvent(fn: Listener) {
  listeners.push(fn);
}