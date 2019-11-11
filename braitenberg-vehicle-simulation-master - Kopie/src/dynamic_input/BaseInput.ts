import Phaser from 'phaser';
import { throttle, isEqual } from 'lodash-es';
import Entity from '../Entity';

export default abstract class BaseInput<T> extends Phaser.GameObjects.DOMElement {
  protected m_value: T;

  protected attribute: Settable<T>;

  private updateValue: () => void;

  protected config: any;

  protected entity: Entity;

  protected showDefaultLabel = true;

  public constructor(scene: Phaser.Scene, attribute: Settable<T>, entity: Entity, config: any = {}) {
    super(scene, 0, 0);

    this.m_value = attribute.get();
    this.attribute = attribute;
    this.config = config;

    this.updateValue = throttle(this.onUpdate, 60);
    this.entity = entity;

    scene.add.existing(this);
  }

  public init(): void {
    const root = document.createElement('div');
    root.className = 'base-input-container';

    if (this.showDefaultLabel && this.config.label) {
      const labelEl = document.createElement('span');
      labelEl.innerText = this.config.label;
      labelEl.style.display = 'block';

      root.appendChild(labelEl);
    }

    const el = this.create(this.entity);
    root.appendChild(el);

    this.setElement(root);

    this.onAfterAppend(root);
  }

  public static create<Q, R extends BaseInput<Q>>(
    this: { new (scene: Phaser.Scene, attr: Settable<Q>, entity: Entity, config: any): R },
    config: any = {},
  ): (scene: Phaser.Scene, attr: Settable<Q>, entity: Entity) => R {
    return (scene: Phaser.Scene, attr: Settable<Q>, entity: Entity) => {
      return new this(scene, attr, entity, config);
    };
  }

  protected abstract create(entity: Entity): Element;

  // eslint-disable-next-line
  protected onUpdate(): void {}

  // eslint-disable-next-line
  protected onAfterAppend(root: HTMLDivElement): void {}

  public set value(value: T) {
    const old = this.m_value;
    this.m_value = value;
    this.updateValue();

    if (!isEqual(old, value)) {
      this.attribute.set(value);
    }
  }

  public get value(): T {
    return this.m_value;
  }
}
