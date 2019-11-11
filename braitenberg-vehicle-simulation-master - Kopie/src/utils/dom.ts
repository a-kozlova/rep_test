export function parseDOM(dom: string): Document {
  return new DOMParser().parseFromString(dom.trim(), 'text/html');
}

export function getNode<T extends Element>(dom: Document | HTMLDivElement, selector: string): T {
  return dom.querySelector(selector) as T;
}
