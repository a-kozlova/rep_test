import BaseInput from './BaseInput';
import { parseDOM, getNode } from '../utils/dom';

export default class ReadonlyPosition extends BaseInput<Vector2D> {
  private spanX: HTMLSpanElement | null = null;

  private spanY: HTMLSpanElement | null = null;

  protected create(): Element {
    const xValue = this.value.x.toFixed(2);
    const yValue = this.value.y.toFixed(2);

    const html = `
      <div>
        X: <span name="pos-x">${xValue}</span>, Y: <span name="pos-y">${yValue}</span>
      </div>
    `;

    const nodes = parseDOM(html);
    const x = getNode<HTMLSpanElement>(nodes, 'span[name="pos-x"]');
    const y = getNode<HTMLSpanElement>(nodes, 'span[name="pos-y"]');

    this.spanX = x;
    this.spanY = y;

    return nodes.body.childNodes[0] as Element;
  }

  protected onUpdate(): void {
    if (this.spanX) {
      this.spanX.innerHTML = this.value.x.toFixed(2);
    }
    if (this.spanY) {
      this.spanY.innerHTML = this.value.y.toFixed(2);
    }
  }
}
