import { DiscriminatedIssue, Future, kind } from "@prophecy/future";

export enum EventKind {
  Click = "click",
  DblClick = "dblclick",
  MouseDown = "mousedown",
  MouseEnter = "mouseenter",
  MouseLeave = "mouseleave",
  MouseMove = "mousemove",
  MouseOver = "mouseover",
  MouseOut = "mouseout",
  MouseUp = "mouseup",
  ContextMenu = "contextmenu",
  KeyDown = "keydown",
  KeyPress = "keypress",
  KeyUp = "keyup",
  Input = "input",
  Change = "change",
  Submit = "submit",
  Reset = "reset",
  Focus = "focus",
  Blur = "blur",
  FocusIn = "focusin",
  FocusOut = "focusout",
  Drag = "drag",
  DragEnd = "dragend",
  DragEnter = "dragenter",
  DragLeave = "dragleave",
  DragOver = "dragover",
  DragStart = "dragstart",
  Drop = "drop",
  Copy = "copy",
  Cut = "cut",
  Paste = "paste",
  TouchStart = "touchstart",
  TouchMove = "touchmove",
  TouchEnd = "touchend",
  TouchCancel = "touchcancel",
  FocusInEvent = "focusin",
  FocusOutEvent = "focusout",
  PointerOver = "pointerover",
  PointerEnter = "pointerenter",
  PointerDown = "pointerdown",
  PointerMove = "pointermove",
  PointerUp = "pointerup",
  PointerCancel = "pointercancel",
  PointerOut = "pointerout",
  PointerLeave = "pointerleave",
  GotPointerCapture = "gotpointercapture",
  LostPointerCapture = "lostpointercapture",
  Resize = "resize",
  Scroll = "scroll",
  Error = "error",
  Abort = "abort",
  Wheel = "wheel",
  LoadStart = "loadstart",
  Progress = "progress",
  Suspend = "suspend",
  AbortEvent = "abort",
  ErrorEvent = "error",
  Load = "load",
  LoadEnd = "loadend",
  TimeUpdate = "timeupdate",
  DurationChange = "durationchange",
  VolumeChange = "volumechange",
  Play = "play",
  Playing = "playing",
  Pause = "pause",
  Waiting = "waiting",
  Ended = "ended",
  Seeked = "seeked",
  Seeking = "seeking",
  RateChange = "ratechange",
  Stalled = "stalled",
  Online = "online",
  Offline = "offline",
  AnimationStart = "animationstart",
  AnimationEnd = "animationend",
  AnimationIteration = "animationiteration",
  TransitionStart = "transitionstart",
  TransitionEnd = "transitionend",
  TransitionRun = "transitionrun",
  TransitionCancel = "transitioncancel",
  VisibilityChange = "visibilitychange",
  Select = "select",
  Show = "show",
  SlotChange = "slotchange",
  Toggle = "toggle",
  BeforeUnload = "beforeunload",
  HashChange = "hashchange",
  PopState = "popstate",
  PageHide = "pagehide",
  PageShow = "pageshow",
  Message = "message",
  Storage = "storage",
  BeforeInput = "beforeinput",
  Invalid = "invalid",
  SubmitEvent = "submit",
  CompositionStart = "compositionstart",
  CompositionUpdate = "compositionupdate",
  CompositionEnd = "compositionend"
}

export class ElementNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "ElementNotFoundIssue";

  public constructor(public readonly identifier: string) { }
}

export class ElementNotInputIssue implements DiscriminatedIssue {
  public readonly [kind] = "ElementNotInputIssue";
}

export const forId = (identifier: string) => {
  return Future.of<HTMLElement, ElementNotFoundIssue>((onValue, onIssue) => {
    const element = document.getElementById(identifier);

    if (element === null) {
      return onIssue(new ElementNotFoundIssue(identifier));
    }

    return onValue(element);
  });
};

export const forEvent = (eventName: string) => (element: HTMLElement) => {
  return Future.of<Event>((onValue) => {
    element.addEventListener(eventName, (event) => {
      onValue(event);
    });

    return null;
  });
};

export const getInputValue = (event: Event) => {
  return Future.of<string, ElementNotInputIssue>((onValue, onIssue) => {
    if (event.target instanceof HTMLInputElement) {
      return onValue(event.target.value);
    }

    return onIssue(new ElementNotInputIssue);
  });
};

export const setTextContent = (textContent: string) => (element: HTMLElement) => {
  return Future.of<HTMLElement>((onValue) => {
    element.textContent = textContent;

    return onValue(element);
  });
};

export function createElement(name: string) {
  return Future.of<HTMLElement>(emitValue => {
    return emitValue(document.createElement(name));
  });
}

export function createTextElement(text: string) {
  return Future.of<Text>(emitValue => {
    return emitValue(document.createTextNode(text));
  });
}

export function setAttribute(name: string, value: string, element: HTMLElement): Future<HTMLElement>
export function setAttribute(name: string, value: string): (element: HTMLElement) => Future<HTMLElement>
export function setAttribute(name: string, value: string, element?: HTMLElement): Future<HTMLElement> | ((element: HTMLElement) => Future<HTMLElement>) {
  function perform(name: string, value: string, element: HTMLElement) {
    return Future.of<HTMLElement>(emitValue => {
      element.setAttribute(name, value);
      return emitValue(element);
    });
  }

  if (element === undefined) {
    return function setAttributeFor(element: HTMLElement) {
      return perform(name, value, element);
    }
  }

  return perform(name, value, element);
}

export function appendChild(child: HTMLElement | Text, parent: HTMLElement): Future<HTMLElement>
export function appendChild(child: HTMLElement | Text): (parent: HTMLElement) => Future<HTMLElement>
export function appendChild(child: HTMLElement | Text, parent?: HTMLElement): Future<HTMLElement> | ((parent: HTMLElement) => Future<HTMLElement>) {
  function perform(child: HTMLElement | Text, parent: HTMLElement) {
    return Future.of<HTMLElement>(emitValue => {
      parent.appendChild(child);
      return emitValue(parent);
    });
  }

  if (parent === undefined) {
    return function appendChildFor(parent: HTMLElement) {
      return perform(child, parent);
    }
  }

  return perform(child, parent);
}