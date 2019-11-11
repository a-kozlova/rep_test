import Phaser from 'phaser';
import Entity from '../Entity';
import { ComponentType, EventType } from '../enums';
import { CORRELATION_SCALE } from '../constants';
import SensorComponent from '../components/SensorComponent';
import TransformableComponent from '../components/TransformableComponent';
import System from './System';
import EventBus from '../EventBus';
import { gaussian, AVAILABLE_ANGLES } from '../utils/reactions';
import Component from '../components/Component';

const mod = (x: number, n: number): number => ((x % n) + n) % n;

export default class SensorSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.SENSOR, ComponentType.TRANSFORMABLE];

  private textures: {
    [componentId: number]: {
      [angle: string]: Phaser.GameObjects.Image;
    };
  } = {};

  public update(): void {
    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const sensors = entity.getMultipleComponents(ComponentType.SENSOR) as SensorComponent[];

      const currentAngle = mod(transform.angle.get(), Math.PI * 2);
      const closestAngle = AVAILABLE_ANGLES.reduce((prev, curr) => {
        return Math.abs(curr - currentAngle) < Math.abs(prev - currentAngle) ? curr : prev;
      });

      sensors.forEach(sensor => {
        if (!this.textures[sensor.id]) {
          return;
        }

        Object.entries(this.textures[sensor.id]).forEach(([angle, image]) => {
          if (angle === String(closestAngle)) {
            const bodyPosition = transform.position.get();
            const sensorOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
              sensor.position.get(),
              transform.angle.get(),
            );
            const x = bodyPosition.x + sensorOffset.x;
            const y = bodyPosition.y + sensorOffset.y;
            image.setPosition(x, y);
            image.setVisible(true);
          } else {
            image.setVisible(false);
          }
        });
      });
    });
  }

  protected onEntityCreated(entity: Entity): void {
    const sensors = entity.getMultipleComponents(ComponentType.SENSOR) as SensorComponent[];
    sensors.forEach(sensor => {
      this.addSensorObject(entity, sensor);

      sensor.angle.onChange(value => {
        this.removeSensorObject(sensor);
        this.addSensorObject(entity, sensor);
      });

      sensor.range.onChange(value => {
        this.removeSensorObject(sensor);
        this.addSensorObject(entity, sensor);
      });

      sensor.reactsTo.onChange(value => {
        this.removeSensorObject(sensor);
        this.addSensorObject(entity, sensor);
      });
    });
  }

  protected onEntityDestroyed(entity: Entity): void {
    const sensors = entity.getMultipleComponents(ComponentType.SENSOR) as SensorComponent[];
    sensors.forEach(sensor => {
      this.removeSensorObject(sensor);
    });
  }

  protected onEntityComponentAdded(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.SENSOR) return;

    const sensor = component as SensorComponent;
    this.addSensorObject(entity, sensor);

    sensor.angle.onChange(value => {
      this.removeSensorObject(sensor);
      this.addSensorObject(entity, sensor);
    });

    sensor.range.onChange(value => {
      this.removeSensorObject(sensor);
      this.addSensorObject(entity, sensor);
    });

    sensor.reactsTo.onChange(value => {
      this.removeSensorObject(sensor);
      this.addSensorObject(entity, sensor);
    });
  }

  protected onEntityComponentRemoved(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.SENSOR) return;

    this.removeSensorObject(component as SensorComponent);
  }

  private addSensorObject(entity: Entity, sensor: SensorComponent): void {
    const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;

    const halfWidth = Math.ceil((sensor.range.get() * 3) / CORRELATION_SCALE);
    const halfHeight = Math.ceil((sensor.range.get() * 3) / CORRELATION_SCALE);
    const width = halfWidth * 2;
    const height = halfHeight * 2;

    const angles = AVAILABLE_ANGLES;

    const gauss = gaussian({ x: 0, y: 0 }, { x: sensor.angle.get(), y: sensor.range.get() });
    const f = (x: number, y: number, rotation: number = 0): number => {
      // `atan2` ist für x = 0 und y = 0 nicht definiert.
      if (x === 0 && y === 0) return 1;

      const newX = Math.cos(-rotation) * x - Math.sin(-rotation) * y;
      const newY = Math.sin(-rotation) * x + Math.cos(-rotation) * y;

      const r = Math.sqrt(newX ** 2 + newY ** 2);
      const phi = Math.atan2(newX, newY);
      return gauss(phi, r);
    };

    const textures: { [angle: string]: Phaser.GameObjects.Image } = {};
    const values: { [angle: string]: Float32Array } = {};
    angles.forEach(angle => {
      const texture = this.scene.textures.createCanvas(`sensor_texture_${sensor.id}_${angle}`, width, height);
      const context = texture.getContext();
      const angleValues = new Float32Array(width * height);

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const v = f((x - halfWidth) * CORRELATION_SCALE, (y - halfHeight) * CORRELATION_SCALE, angle);

          angleValues[y * width + x] = v;

          context.fillStyle = `rgba(50, 50, 100, ${v * 0.6})`;
          context.fillRect(x, y, 1, 1);
        }
      }

      // window.open(offScreenCanvas.toDataURL(), '_blank');
      // window.open(offScreenCanvasDown.toDataURL(), '_blank');

      texture.refresh();

      const x = transform.position.get().x + sensor.position.get().x;
      const y = transform.position.get().y + sensor.position.get().y;
      const image = this.scene.add.image(x, y, `sensor_texture_${sensor.id}_${angle}`);
      image.setScale(CORRELATION_SCALE);
      // image.setBlendMode(Phaser.BlendModes.SCREEN);
      image.setVisible(false);
      image.setDepth(99);
      this.scene.children.bringToTop(image);

      textures[angle] = image;
      values[angle] = angleValues;
    });

    this.textures[sensor.id] = textures;

    EventBus.publish(EventType.SENSOR_CREATED, {
      id: sensor.id,
      type: sensor.reactsTo.get(),
      values,
      width,
      height,
    });
  }

  private removeSensorObject(sensor: SensorComponent): void {
    const angleTextures = this.textures[sensor.id];

    Object.keys(angleTextures).forEach(key => {
      angleTextures[key].destroy();
      this.scene.textures.remove(`sensor_texture_${sensor.id}_${key}`);
    });

    delete this.textures[sensor.id];

    EventBus.publish(EventType.SENSOR_DESTROYED, {
      id: sensor.id,
      type: sensor.reactsTo.get(),
    });
  }
}
