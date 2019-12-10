import { ComponentType } from '../enums';
import Attribute from './Attribute';

export default abstract class Component {
  // Hier wird einmal festgelegt, was für Typen die Klasse enthalten kann,
  // das ist nötig, damit später über diese mit `Object.keys(this)` drüber
  // iteriert werden kann.
  [key: string]: number | boolean | string | Attribute<any, any> | Function;

  public abstract name: ComponentType;

  public id: number;

  private static count = 0;

  protected maxAmount: number = Infinity;

  protected deletable: boolean = true;

  protected infoTip: string = '';

  public constructor() {
    this.id = Component.count;
    Component.count += 1;
  }

  public getMaxAmount(): number {
    return this.maxAmount;
  }

  public isDeletable(): boolean {
    return this.deletable;
  }

  public getInfo(): string {
    return this.infoTip;
  }

  protected serializeAttributes(): any {
    const attrs: { [key: string]: any } = {};
    Object.keys(this).forEach(attr => {
      if (this[attr] instanceof Attribute) {
        attrs[attr] = (this[attr] as Attribute<any, any>).get();
      }
    });

    return attrs;
  }

  public serialize(): SerializedComponent {
    const attributes = this.serializeAttributes();

    return {
      id: this.id,
      name: this.name,
      attributes,
    };
  }
}
