import Phaser from 'phaser';
import { ComponentType, BodyShape } from '../enums';
import Component from './Component';
import Attribute from './Attribute';
import TextInput from '../dynamic_input/TextInput';
import NumberInput from '../dynamic_input/NumberInput';
import HiddenInput from '../dynamic_input/HiddenInput';
import SelectInput from '../dynamic_input/SelectInput';
import LoadingScene from '../scenes/LoadingScene';
import SizeInput from '../dynamic_input/SizeInput';

interface RenderComponentData {
  asset: AssetKey | Color;
  size: Dimensions | number;
  shape?: BodyShape;
  blendMode?: Phaser.BlendModes;
}

export default class RenderComponent extends Component {
  public name: ComponentType = ComponentType.RENDER;

  public asset: Attribute<AssetKey | Color, SelectInput<any>>;

  public size: Attribute<Dimensions, SizeInput>;

  public shape: Attribute<BodyShape, SelectInput<BodyShape>>;

  public blendMode: Attribute<Phaser.BlendModes, HiddenInput>;

  protected maxAmount = 1;

  protected deletable: boolean = false;

  protected infoTip: string =
    'Attention! This component determines only the visual representation and is independent of the component for a solid body.';

    public constructor(data: RenderComponentData) {
        super();
        this.asset = new Attribute(
            data.asset,
            SelectInput.create<any, SelectInput<any>>({
                label: 'Anzeige',
                options: {
                    ...LoadingScene.userOptions(),
					'Farbe: Schwarz': 0x000000,
                    'Farbe: Grau': 0xcccccc,
                    'Farbe: Rot': 0xd14152,
                    'Farbe: Grün': 0x57a639,
                    'Farbe: Blau': 0x1b5583,
                    'Farbe: Yellow': 0xffff00,
                },
            }),
        );
        this.blendMode = new Attribute(data.blendMode || Phaser.BlendModes.NORMAL, HiddenInput.create());
        // this.size = new Attribute(data.size, NumberInput.create({ label: 'Größe' }));
        if (typeof data.size === 'number') {
            this.size = new Attribute(
                { width: data.size, height: 0 },
                SizeInput.create({ label: 'Größe', min: 0, max: 4000 }),
            );
        } else {
            this.size = new Attribute(
                data.size || { width: 50, height: 50 },
                SizeInput.create({ label: 'Größe', min: 0, max: 4000 }),
            );
        }
        this.shape = new Attribute(
                data.shape || BodyShape.RECTANGLE,
                SelectInput.create<BodyShape, SelectInput<BodyShape>>({ label: 'Form', options: BodyShape }),
            );
    }

    public setColor(color: string) {

        switch (color) {
		    case 'black': {
                this.asset.set(0x000000);
                break;
            }
            case 'grey': {
                this.asset.set(0xcccccc);
                break;
            }
            case 'red': {
                this.asset.set(0xd14152);
                break;
            }
            case 'green': {
                this.asset.set(0x57a639);
                break;
            }
            case 'blue': {
                this.asset.set(0x1b5583);
                break;
            }
            case 'yellow': {
                this.asset.set(0xffff00);
                break;
            }
        }
    }

      public setShape(shape: string) {
          switch (shape) {
              case 'circle': {
                  this.shape.set( BodyShape.CIRCLE);
                  break;
              }
              case 'rectangle': {
                  this.shape.set(BodyShape.RECTANGLE);
                  break;
              }
          }  
    }
    
    public setSize(size: Dimensions) {
        this.size.set(size)
    }
}
