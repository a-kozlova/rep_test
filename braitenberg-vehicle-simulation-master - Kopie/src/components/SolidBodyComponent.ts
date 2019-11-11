import { ComponentType, BodyShape } from '../enums';
import Component from './Component';
import Attribute from './Attribute';
import SelectInput from '../dynamic_input/SelectInput';
import Checkbox from '../dynamic_input/Checkbox';
import SizeInput from '../dynamic_input/SizeInput';

interface SolidBodyComponentData {
  size?: Dimensions | number;
  shape?: BodyShape;
  isStatic?: boolean;
}

export default class SolidBodyComponent extends Component {
  public name: ComponentType = ComponentType.SOLID_BODY;

  public size: Attribute<Dimensions, SizeInput>;

  public shape: Attribute<BodyShape, SelectInput<BodyShape>>;

  public isStatic: Attribute<boolean, Checkbox>;

  protected maxAmount = 1;

  public constructor(data: SolidBodyComponentData) {
    super();
    if (typeof data.size === 'number') {
      this.size = new Attribute(
        { width: data.size, height: data.size },
        SizeInput.create({ label: 'Größe', min: 20, max: 500 }),
      );
    } else {
      this.size = new Attribute(
        data.size || { width: 50, height: 50 },
        SizeInput.create({ label: 'Größe', min: 20, max: 500 }),
      );
    }
    this.shape = new Attribute(
      data.shape || BodyShape.RECTANGLE,
      SelectInput.create<BodyShape, SelectInput<BodyShape>>({ label: 'Form', options: BodyShape }),
    );
    this.isStatic = new Attribute(data.isStatic || false, Checkbox.create({ label: 'Statisch' }));
  }
}
