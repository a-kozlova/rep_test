import BaseInput from '../dynamic_input/BaseInput';
import Entity from '../Entity';

type ElementConstructor<T, S> = (scene: Phaser.Scene, attr: Settable<T>, entity: Entity) => S;

type ChangeHandler<T> = (value: T, oldValue: T) => void;

export default class Attribute<T, S extends BaseInput<T>> implements Settable<T> {
  private value: T;

  private createElement: ElementConstructor<T, S>;

  private el: S | null = null;

  private changeHanlers: ChangeHandler<T>[] = [];

  /**
   * Der Konstruktor!
   *
   * @param value
   * @param renderAs
   */
  public constructor(value: T, renderAs: ElementConstructor<T, S>) {
    this.value = value;
    this.createElement = renderAs;
  }

  public get(): T {
    return this.value;
  }

  public set(value: T, silent: boolean = false): void {
    const oldValue = this.value;

    this.value = value;

    if (this.el && !silent) {
      this.el.value = value;
    }

    if (value !== oldValue && !silent) {
      this.changeHanlers.forEach(handler => handler(value, oldValue));
    }
  }

  public onChange(handler: ChangeHandler<T>): void {
    this.changeHanlers.push(handler);
  }

  public removeHandler(handler: ChangeHandler<T>): void {
    const found = this.changeHanlers.findIndex(h => h === handler);
    if (found) {
      this.changeHanlers.splice(found, 1);
    }
  }

  public render(scene: Phaser.Scene, entity: Entity): S {
    this.el = this.createElement(scene, this, entity);
    this.el.init();

    return this.el;
  }

  public renderedAs(type: any): boolean {
    return this.createElement === type;
  }
}
