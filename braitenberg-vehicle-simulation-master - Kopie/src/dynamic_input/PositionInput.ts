import Phaser from 'phaser';
import { throttle } from 'lodash-es';
import interact from 'interactjs';
import BaseInput from './BaseInput';
import Entity from '../Entity';
import { ComponentType } from '../enums';
import SolidBodyComponent from '../components/SolidBodyComponent';
import { calculateAspectRatioFit } from '../utils/size';
import { parseDOM, getNode } from '../utils/dom';

export default class PositionInput extends BaseInput<Vector2D> {
  protected position: Vector2D = { x: 0, y: 0 };

  protected create(entity: Entity): Element {
    const solidBody = entity.getComponent(ComponentType.SOLID_BODY);

    let rect = { width: 100, height: 100 };
    let widthRatio = 1;
    let heightRatio = 1;
    if (solidBody) {
      const { shape, size } = solidBody as SolidBodyComponent;
      rect = calculateAspectRatioFit(size.get().width, size.get().height, 100, 100);
      widthRatio = rect.width / size.get().width;
      heightRatio = rect.height / size.get().height;
    }

    this.position.x = rect.width / 2 - this.value.x * widthRatio;
    this.position.y = rect.height / 2 - this.value.y * heightRatio;

    const html = `
      <div class="position-background" style="width:${rect.width}px;height:${rect.height}px;">
        <div class="direction-indicator" style="left:${rect.width / 2 - 5}px"></div>
        <div class="draggable position-indicator"></div>
      </div>
    `;
    const nodes = parseDOM(html);
    const dragEl = getNode<HTMLDivElement>(nodes, '.position-indicator');
    dragEl.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;

    const snappingSize = 10;

    interact(dragEl)
      .draggable({})
      .on(
        'dragmove',
        throttle(event => {
          const { target, dx, dy } = event;

          this.position.x = Phaser.Math.Clamp(this.position.x + dx, 0, rect.width);
          this.position.y = Phaser.Math.Clamp(this.position.y + dy, 0, rect.height);

          // Es wird immer auf 5-px Schritte gerundet bzw. "gesnappt".
          let newX = Math.round(this.position.x / snappingSize / widthRatio) * snappingSize * widthRatio;
          let newY = Math.round(this.position.y / snappingSize / heightRatio) * snappingSize * heightRatio;

          newX = Phaser.Math.Clamp(Math.round(newX), 0, rect.width);
          newY = Phaser.Math.Clamp(Math.round(newY), 0, rect.height);

          target.style.transform = `translate(${newX}px, ${newY}px)`;
        }),
      )
      .on('dragend', () => {
        const x = Math.floor(this.position.x / widthRatio);
        const y = Math.floor(this.position.y / heightRatio);

        this.value = { x: rect.width / widthRatio / 2 - x, y: rect.height / heightRatio / 2 - y };
      });

    return nodes.body.childNodes[0] as Element;
  }
}
