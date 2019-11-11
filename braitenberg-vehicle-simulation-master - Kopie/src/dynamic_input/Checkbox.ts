import BaseInput from './BaseInput';
import { parseDOM, getNode } from '../utils/dom';

export default class Checkbox extends BaseInput<boolean> {
  private inputElement: HTMLInputElement | null = null;

  protected showDefaultLabel = false;

  protected create(): Element {
    const html = `
      <label>
        <input type="checkbox">
        <span class="checkable">${this.config.label}</span>
      </label>
    `;

    const nodes = parseDOM(html);
    const inp = getNode<HTMLInputElement>(nodes, 'input');
    inp.checked = this.value;
    inp.addEventListener('change', () => {
      this.value = inp.checked;
    });

    this.inputElement = inp;

    return nodes.body.childNodes[0] as Element;
  }

  protected onUpdate(): void {
    if (this.inputElement) {
      this.inputElement.checked = this.value;
    }
  }
}
