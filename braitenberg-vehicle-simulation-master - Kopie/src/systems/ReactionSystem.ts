import Phaser from 'phaser';
import Noty from 'noty';
import { debounce } from 'lodash-es';
import { conv2d, squeeze, tidy, Tensor2D, tensor4d, keep, memory } from '@tensorflow/tfjs-core';
import System from './System';
import { ComponentType, EventType, SubstanceType } from '../enums';
import { CORRELATION_SCALE } from '../constants';
import EventBus from '../EventBus';
import TransformableComponent from '../components/TransformableComponent';
import SensorComponent from '../components/SensorComponent';
import { AVAILABLE_ANGLES } from '../utils/reactions';
import { gaussianRandom } from '../utils/math';

const mod = (x: number, n: number): number => ((x % n) + n) % n;

export default class ReactionSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.SENSOR];

  private sensors: { [id: number]: EventMessages.NewSensorInfo } = {};

  private sources: { [id: number]: EventMessages.NewSourceInfo } = {};

  private correlations: { [sensorAnglePair: string]: number[][] } = {};

  private sourcesCombined: { [type: string]: Float32Array } = {};

  private width: number = 0;

  private height: number = 0;

  private maxValue: number = 0;

  private compute: () => void;

  public constructor(scene: Phaser.Scene) {
    super(scene);

    this.compute = debounce(() => {
      const noty = new Noty({
        text: '<i class="fa fa-sync-alt fa-spin"></i> Calculation is being performed...',
        timeout: false,
        animation: {
          open: null,
        },
      });
      noty.show();

      setTimeout(() => {
        this.maxValue = 0;
        const promises = Object.values(SubstanceType).map(type => this.computeCorrelation(type));

        Promise.all(promises).then(() => noty.close());
      }, 10);
    }, 100);

    EventBus.subscribe(EventType.SENSOR_CREATED, this.onSensorCreated.bind(this));
    EventBus.subscribe(EventType.SOURCE_CREATED, this.onSourceCreated.bind(this));

    EventBus.subscribe(EventType.SENSOR_DESTROYED, this.onSensorDestroyed.bind(this));
    EventBus.subscribe(EventType.SOURCE_DESTROYED, this.onSourceDestroyed.bind(this));
  }

  public update(): void {
    if (this.isPaused) return;

    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const sensors = entity.getMultipleComponents(ComponentType.SENSOR) as SensorComponent[];

      const currentAngle = mod(transform.angle.get(), Math.PI * 2);
      const closestAngle = AVAILABLE_ANGLES.reduce((prev, curr) => {
        return Math.abs(curr - currentAngle) < Math.abs(prev - currentAngle) ? curr : prev;
      });

      sensors.forEach(sensor => {
        const lookUpKey = `${sensor.id}:${closestAngle}`;

        if (!this.correlations[lookUpKey]) {
          return;
        }

        const bodyPosition = transform.position.get();
        const sensorOffset = Phaser.Physics.Matter.Matter.Vector.rotate(sensor.position.get(), transform.angle.get());
        const x = Math.floor((bodyPosition.x + sensorOffset.x) / CORRELATION_SCALE);
        const y = Math.floor((bodyPosition.y + sensorOffset.y) / CORRELATION_SCALE);

        if (
          !this.correlations[lookUpKey][y] ||
          this.correlations[lookUpKey][y][x] === undefined ||
          Number.isNaN(this.correlations[lookUpKey][y][x])
        ) {
          sensor.activation.set(0);
          return;
        }

        const value = this.correlations[lookUpKey][y][x]; // / this.maxValue;
        const noise = gaussianRandom(-0.0003, 0.0003);
        sensor.activation.set(value + noise);
      });
    });
  }
/*
  private computeCorrelation(type: SubstanceType): Promise<void> {
    return new Promise((resolve, reject) => {
      const sensors = Object.values(this.sensors).filter(s => s.type === type);

      const { width, height } = this;

      sensors.forEach(sensor => {
        Object.entries(sensor.values).forEach(([angle, angleValues]) => {
          const lookUpKey = `${sensor.id}:${angle}`;

          tidy(() => {
            const sensorTensor = tensor4d(angleValues, [sensor.height, sensor.width, 1, 1]);
			const sourcesTensor = tensor4d(this.sourcesCombined[type], [1, height, width, 1]);

            const conv = squeeze<Tensor2D>(conv2d(sourcesTensor, sensorTensor, 1, 'same'));

            // conv.array().then(res => {
            //   values = res;
            // });
            const maxTensor = conv.max();
            const result = conv.div<Tensor2D>(maxTensor);
            result.array().then(value => {
              this.correlations[lookUpKey] = value;
              // console.log(lookUpKey, type, value);
              // this.maxValue = max;
              resolve();
            });
          });
        });
      });
    });
  }
*/
  private computeCombinedSources(type: SubstanceType): void {
    const combined = new Float32Array(this.width * this.height);
    const sources = Object.values(this.sources).filter(s => s.type === type);

    for (let i = 0; i < combined.length; i += 1) {
      const sum = sources.reduce((acc, source) => {
        if (source.values[i] !== undefined) {
          return Math.max(acc, source.values[i]);
        }

        return acc;
      }, 0);
      combined[i] = sum;
    }

    this.sourcesCombined[type] = combined;
  }

  private onSourceCreated(payload: EventMessages.NewSourceInfo): void {
    this.sources[payload.id] = payload;
    this.width = payload.width;
    this.height = payload.height;

    this.computeCombinedSources(payload.type);
    //this.compute();
  }

  private onSensorCreated(payload: EventMessages.NewSensorInfo): void {
    this.sensors[payload.id] = payload;
    //this.compute();
  }

  private onSourceDestroyed(payload: EventMessages.SourceOrSensorDestroyedInfo): void {
    delete this.sources[payload.id];
    this.computeCombinedSources(payload.type);
    //this.compute();
  }

  private onSensorDestroyed(payload: EventMessages.SourceOrSensorDestroyedInfo): void {
    delete this.sensors[payload.id];
    //this.compute();
  }
}
