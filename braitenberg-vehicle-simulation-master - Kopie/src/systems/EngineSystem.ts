import Phaser from 'phaser';
import System from './System';
import { ComponentType, EventType } from '../enums';
import TransformableComponent from '../components/TransformableComponent';
import MotorComponent from '../components/MotorComponent';
import EventBus from '../EventBus';

export default class EngineSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.MOTOR];

  public update(): void {
    if (this.isPaused) return;

    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const motors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];

      motors.forEach(motor => {
        // Wir müssen die neue "Position des Motors" am Vehikel berechnen
        const offset = Phaser.Physics.Matter.Matter.Vector.rotate(motor.position.get(), transform.angle.get());
        // const throttle = Math.min(motor.throttle, 1);
        // const thrust = Math.max(motor.defaultSpeed.get(), throttle * motor.maxSpeed.get());

        const base = Number(motor.defaultSpeed.get());
        const max = Number(motor.maxSpeed.get());
        const thrust = base + (max - base) * motor.throttle.get();

        motor.visualThrottle.set(thrust.toFixed(2));

        // Es muss auch die Richtung "nach vorne" berechnet werden, da das Vehikel eine Rotation
        // haben kann.
        const force = Phaser.Physics.Matter.Matter.Vector.rotate({ x: 0, y: thrust * 0.001 }, transform.angle.get());

        EventBus.publish(EventType.APPLY_FORCE, {
          id: entity.id,
          offset,
          force,
        });
      });
    });
  }
}
