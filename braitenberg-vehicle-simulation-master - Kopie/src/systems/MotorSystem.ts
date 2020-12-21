import Phaser from 'phaser';
import Entity from '../Entity';
import { ComponentType, EventType } from '../enums';
import { CORRELATION_SCALE } from '../constants';
import MotorComponent from '../components/MotorComponent';
import TransformableComponent from '../components/TransformableComponent';
import System from './System';
import EventBus from '../EventBus';
import { gaussian, AVAILABLE_ANGLES } from '../utils/reactions';
import Component from '../components/Component';

const mod = (x: number, n: number): number => ((x % n) + n) % n;

export default class MotorSystem extends System {
    public expectedComponents: ComponentType[] = [ComponentType.MOTOR, ComponentType.TRANSFORMABLE];

    private grs: { [componentId: number]: Phaser.GameObjects.Graphics } = {};
    
    public update(): void {

        this.entities.forEach(entity => {
            const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
            const motors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];

            motors.forEach(motor => {
                if (!this.grs[motor.id]) {
                    return;
                }

                this.grs[motor.id].clear();
                
                const bodyPosition = transform.position.get();
                const motorOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
                    motor.position.get(),
                    transform.angle.get(),
                );
                const x = bodyPosition.x + motorOffset.x;
                const y = bodyPosition.y + motorOffset.y;
              
                this.grs[motor.id].lineStyle(2, 'black', 1);

                let colorAlpha = Number(motor.visualThrottle.get())/100;
                this.grs[motor.id].fillStyle(0xff0000, colorAlpha);
                this.grs[motor.id].fillCircle(x, y, 7);
                this.grs[motor.id].strokeCircle(x, y, 7);
            });
        });
    }

    protected onEntityCreated(entity: Entity): void {
        const motors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];
        motors.forEach(motor => {
            this.addMotorObject(entity, motor);

            motor.maxSpeed.onChange(value => {
                this.removeMotorObject(motor);
                this.addMotorObject(entity, motor);
            });

            motor.defaultSpeed.onChange(value => {
                this.removeMotorObject(motor);
                this.addMotorObject(entity, motor);
            });

        });
    }

    protected onEntityDestroyed(entity: Entity): void {
        const motors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];
        motors.forEach(motor => {
            this.removeMotorObject(motor);
        });
    }

    protected onEntityComponentAdded(entity: Entity, component: Component): void {
        if (component.name !== ComponentType.MOTOR) return;

        const motor = component as MotorComponent;
        this.addMotorObject(entity, motor);

        motor.maxSpeed.onChange(value => {
            this.removeMotorObject(motor);
            this.addMotorObject(entity, motor);
        });

        motor.defaultSpeed.onChange(value => {
            this.removeMotorObject(motor);
            this.addMotorObject(entity, motor);
        });
    }

    protected onEntityComponentRemoved(entity: Entity, component: Component): void {
        if (component.name !== ComponentType.MOTOR) return;

        this.removeMotorObject(component as MotorComponent);
    }

    private addMotorObject(entity: Entity, motor: MotorComponent): void {
        const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
        const bodyPosition = transform.position.get();
        const motorOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
            motor.position.get(),
            transform.angle.get(),
        );
        const x = bodyPosition.x + motorOffset.x;
        const y = bodyPosition.y + motorOffset.y;
            
        const graphics = this.scene.add.graphics();

        var color = 0xffff00;
        var thickness = 2;
        var alpha = 1;

        graphics.lineStyle(thickness, color, alpha);
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(x,y,5);
        graphics.strokeCircle(x, y, 5);
        graphics.setDepth(999);
        this.grs[motor.id] = graphics;
    }

    private removeMotorObject(motor: MotorComponent): void {
        this.grs[motor.id].clear();
        delete this.grs[motor.id];
    }
}
