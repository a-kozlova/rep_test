import BaseInput from './BaseInput';
import { parseDOM, getNode } from '../utils/dom';

export default class SizeInput extends BaseInput<Dimensions> {
  protected showDefaultLabel = false;

  protected create(): Element {
    const min = this.config.min !== undefined ? this.config.min : -Infinity;
    const max = this.config.max !== undefined ? this.config.max : Infinity;

    const html = `
      <div>
        <label>Breite</label>
        <input name="width" type="number" min="${min}" max="${max}"></input>
        <label>Höhe</label>
        <input name="height" type="number" min="${min}" max="${max}"></input>
      </div>
    `;

    const nodes = parseDOM(html);
    const width = getNode<HTMLInputElement>(nodes, 'input[name="width"]');
    const height = getNode<HTMLInputElement>(nodes, 'input[name="height"]');

    width.value = String(this.value.width);
    height.value = String(this.value.height);

    width.addEventListener('change', () => {
      const value = Number(width.value);

      if (value >= min && value <= max) {
        this.value = { width: Number(width.value), height: Number(height.value) };
      }

      width.reportValidity();
    });
    height.addEventListener('change', () => {
      const value = Number(height.value);

      if (value >= min && value <= max) {
        this.value = { width: Number(width.value), height: Number(height.value) };
      }

      height.reportValidity();
    });

    return nodes.body.childNodes[0] as Element;
  }
}
