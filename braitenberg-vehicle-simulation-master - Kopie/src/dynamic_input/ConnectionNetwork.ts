import swal from 'sweetalert';

import BaseInput from './BaseInput';
import Entity from '../Entity';
import { parseDOM, getNode } from '../utils/dom';

export default class ConnectionNetwork extends BaseInput<ConnectionNetworkData> {
  protected showDefaultLabel = false;

  // eslint-disable-next-line
  protected create(entity: Entity): Element {
    const connection = this.value;

    const inputs = connection.inputs.map(
      (id: number) => `<div
        data-input-id="${id}"
        class="connection-draggable connection-input-indicator tooltip-top"
        data-tooltip="${id}"
      ></div>`,
    );

    const outputs = connection.outputs.map(
      (id: number) => `<div
        data-output-id="${id}"
        class="connection-dropzone connection-output-indicator tooltip-top"
        data-tooltip="${id}"
      ></div>`,
    );

    const lines: string[] = [];
    connection.inputs.forEach((inp: number) => {
      connection.outputs.forEach((out: number) => {
        lines.push(`<div
        data-connection-from="${inp}"
        data-connection-to="${out}"
        class="connection-line"
      ></div>`);
      });
    });

    const html = `
      <div class="connection-network-background">
        <div>${lines.join('')}</div>
        <div class="text-center">Sensoren</div>
        <div class="connection-inputs">${inputs.join('')}</div>
        <div class="connection-outputs">${outputs.join('')}</div>
        <div class="text-center">Motoren</div>
      </div>
    `;
    const nodes = parseDOM(html);

    return nodes.body.childNodes[0] as Element;
  }

  // eslint-disable-next-line
  protected onAfterAppend(root: HTMLDivElement): void {
    const lineElements = root.querySelectorAll<HTMLDivElement>('.connection-line');
    lineElements.forEach(line => {
      const fromId = line.dataset.connectionFrom;
      const toId = line.dataset.connectionTo;
      const from = getNode<HTMLDivElement>(root, `[data-input-id="${fromId}"`);
      const to = getNode<HTMLDivElement>(root, `[data-output-id="${toId}"`);

      const index1 = this.value.inputs.indexOf(Number(fromId));
      const index2 = this.value.outputs.indexOf(Number(toId));

      const stats = ConnectionNetwork.line(from, to);
      const value = this.value.weights[index1][index2];
      line.style.width = `${stats.width}px`;
      line.style.left = `${stats.offsetLeft}px`;
      line.style.top = `${stats.offsetTop}px`;
      line.style.transform = stats.transform;
      line.style.opacity = String(Math.max(Math.abs(value), 0.1));
      line.style.backgroundColor = Math.sign(value) >= 0 ? 'black' : 'red';

      line.addEventListener('click', (event: MouseEvent) => {
        this.promptForValue(
          `Trage hier das Gewicht zwischen -1 und 1 ein (${fromId} -> ${toId})`,
          line,
          index1,
          index2,
        );
      });
    });
  }

  private promptForValue(text: string, line: HTMLDivElement, index1: number, index2: number): void {
    swal({
      text,
      buttons: {
        cancel: { text: 'Abbrechen', value: '__EXIT__', visible: true },
        confirm: { text: 'Übernehmen' },
      },
      content: {
        element: 'input',
        attributes: {
          placeholder: 'Bitte tippe hier das Gewicht ein.',
          value: this.value.weights[index1][index2],
        },
      },
    }).then((value: string) => {
      if (value === '__EXIT__') {
        return;
      }

      // https://github.com/t4t5/sweetalert/issues/809
      if (value === '') {
        return;
      }

      if (!value || Number.isNaN(Number(value)) || Number(value) < -1 || Number(value) > 1) {
        swal('Der Wert muss zwischen -1 und 1 liegen. ').then(() => {
          this.promptForValue(text, line, index1, index2);
        });
        return;
      }

      const v = Number(value);
      this.value.weights[index1][index2] = v;
      line.style.opacity = String(Math.max(Math.abs(v), 0.1));
      line.style.backgroundColor = Math.sign(v) >= 0 ? 'black' : 'red';
    });
  }

  private static line(
    start: HTMLDivElement,
    end: HTMLDivElement,
  ): { width: number; transform: string; offsetLeft: number; offsetTop: number } {
    const x1 = start.offsetLeft + 7;
    const y1 = start.offsetTop + 7;
    const x2 = end.offsetLeft + 7;
    const y2 = end.offsetTop + 7;

    const width = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const transform = `rotate(${angle}deg)`;

    return {
      width,
      transform,
      offsetLeft: x1,
      offsetTop: y1,
    };
  }
}
