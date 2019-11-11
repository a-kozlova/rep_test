import { matrix, ones } from 'mathjs';

import { ComponentType } from '../enums';
import Component from './Component';
import Attribute from './Attribute';
import ConnectionNetwork from '../dynamic_input/ConnectionNetwork';

interface ConnectionComponentData {
  inputIds: number[];
  outputIds: number[];
  weights?: number[][];
}

export default class ConnectionComponent extends Component {
  public name: ComponentType = ComponentType.CONNECTION;

  public network: Attribute<ConnectionNetworkData, ConnectionNetwork>;

  protected maxAmount: number = 1;

  public constructor(data: ConnectionComponentData) {
    super();

    let w;

    if (data.weights === undefined) {
      const m = matrix(ones(data.inputIds.length, data.outputIds.length).toArray());
      const dim = m.size().length;
      if (dim !== 2) {
        w = [[]];
      } else {
        w = m.toArray();
      }
    } else {
      w = data.weights;
    }

    this.network = new Attribute(
      {
        inputs: data.inputIds,
        outputs: data.outputIds,
        weights: w,
      },
      ConnectionNetwork.create({ label: 'Verbindungen' }),
    );
  }

  public serializeAttributes(): ConnectionComponentData {
    return {
      inputIds: this.network.get().inputs,
      outputIds: this.network.get().outputs,
      weights: this.network.get().weights,
    };
  }
}
