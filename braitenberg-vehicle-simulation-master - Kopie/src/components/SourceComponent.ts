import { ComponentType, SubstanceType, EmissionType } from '../enums';
import Component from './Component';
import Attribute from './Attribute';
import SelectInput from '../dynamic_input/SelectInput';
import NumberInput from '../dynamic_input/NumberInput';

interface SourceComponentData {
  range: number;
  substance?: SubstanceType;
  emissionType?: EmissionType;
}

export default class SourceComponent extends Component {
  public name: ComponentType = ComponentType.SOURCE;

  public range: Attribute<number, NumberInput>;

  public substance: Attribute<SubstanceType, SelectInput<SubstanceType>>;

  public emissionType: Attribute<EmissionType, SelectInput<EmissionType>>;
  
  public originalRange: Attribute<number, NumberInput>;

  public isActive: boolean;

  public constructor(data: SourceComponentData) {
    super();
    this.range = new Attribute(data.range, NumberInput.create({ label: 'Reichweite' }));
	this.originalRange = new Attribute(data.range, NumberInput.create({ label: 'Reichweite' }));
    this.substance = new Attribute(
      data.substance || SubstanceType.LIGHT,
      SelectInput.create<SubstanceType, SelectInput<SubstanceType>>({ label: 'Substanz', options: SubstanceType }),
    );
    this.emissionType = new Attribute(
      data.emissionType || EmissionType.GAUSSIAN,
      SelectInput.create<EmissionType, SelectInput<EmissionType>>({ label: 'Charakteristik', options: EmissionType }),
    );
	this.isActive = this.range.value === 0 ? false : true;
	
  }
	
	public activateSourceComponent (){
		if(this.originalRange.value === 0){
			this.range.set(100);
		} else {
			this.range.set(this.originalRange.get());
		}
		this.isActive = true;		
	}
	public deactivateSourceComponent (){
		this.originalRange.set(this.range.get());
		this.range.set(0);
		this.isActive = false;
	}
   public setRange (range: number){
		this.range.set(range);
   }

   public setSubstanceType(substance){
	switch (substance) {
		case 'source': {
			this.substance.set(SubstanceType.LIGHT);
			break;
		}
		case 'barrier': {
			this.substance.set(SubstanceType.BARRIER);
			break;
		}
	}	
	
	}

	public setEmissionType(emission){
	switch (emission) {
		case 'gaus': {
			this.emissionType.set(EmissionType.GAUSSIAN);
			break;
		}
		case 'flat': {
			this.emissionType.set(EmissionType.FLAT);
			this.range.set(100);
			break;
		}
	}
	}
}
