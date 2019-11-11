declare module '*.png' {
  const value: string;
  export default value;
}

declare module 'mathjs';

declare namespace EventMessages {
  interface ApplyForce {
    id: number;
    offset: Phaser.Physics.Matter.Matter.Vector;
    force: Phaser.Physics.Matter.Matter.Vector;
  }

  interface SensorActive {
    id: number;
    activation: number;
  }

  interface NewSourceInfo {
    id: number;
    values: Float32Array;
    type: import('../src/enums').SubstanceType;
    width: number;
    height: number;
  }

  interface NewSensorInfo {
    id: number;
    values: { [angle: number]: Float32Array };
    type: import('../src/enums').SubstanceType;
    width: number;
    height: number;
  }

  interface SourceOrSensorDestroyedInfo {
    id: number;
    type: import('../src/enums').SubstanceType;
  }

  type Reaction = CollisionBodies;
}

type ComponentPhysicsBody = Phaser.Physics.Matter.Matter.Body & {
  userData: {
    belongsTo: {
      entity: import('../src/Entity').default;
      component: import('../src/components/Component').default;
    };
  };
};

type SensorPhysicsObject = ComponentPhysicsBody & {
  userData: {
    kernel: (x: number, y: number) => number;
    tensors: {
      angle: number;
      tensor: import('@tensorflow/tfjs-core').Tensor4D;
    }[];
    belongsTo: {
      component: import('../src/components/SensorComponent').default;
    };
  };
};

type SourcePhysicsObject = ComponentPhysicsBody & {
  userData: {
    belongsTo: {
      component: import('../src/components/SourceComponent').default;
    };
  };
};

interface CollisionBodies {
  sensor: SensorPhysicsObject;
  other: ComponentPhysicsBody;
}

interface SerializedComponent {
  id: number;
  name: import('../src/enums').ComponentType;
  attributes: any;
}

interface SerializedEntity {
  id: number;
  components: SerializedComponent[];
}

interface Settable<T> {
  public get(): T;
  public set(value: T): void;
}

interface ConnectionNetworkData {
  inputs: number[];
  outputs: number[];
  weights: number[][];
}

// interface ReactionPair<T extends ComponentPhysicsBody, S extends ComponentPhysicsBody> {

// };

type AssetKey = string;
type EventMessage =
  | EventMessages.ApplyForce
  | EventMessages.SensorActive
  | EventMessages.Reaction
  | import('../src/Entity').default
  | EventMessages.NewSourceInfo
  | EventMessages.SourceOrSensorDestroyedInfo
  | EventMessages.NewSensorInfo;
type EventHandler =
  | ((event: EventMessages.ApplyForce) => void)
  | ((event: EventMessages.SensorActive) => void)
  | ((event: EventMessages.Reaction) => void)
  | ((event: import('../src/Entity').default) => void)
  | ((event: EventMessages.NewSensorInfo) => void)
  | ((event: EventMessages.SourceOrSensorDestroyedInfo) => void)
  | ((event: EventMessages.NewSourceInfo) => void);

interface Dimensions {
  width: number;
  height: number;
}

type Color = number;

type Vector2D = Phaser.Physics.Matter.Matter.Vector;
