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

    private textures: { [componentId: number]:  Phaser.GameObjects.Image } = {};
    
    public update(): void {
        /*this.entities.forEach(entity => {
            const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
            const sensors = entity.getMultipleComponents(ComponentType.SENSOR) as MotorComponent[];

            const currentAngle = mod(transform.angle.get(), Math.PI * 2);
            const closestAngle = AVAILABLE_ANGLES.reduce((prev, curr) => {
                return Math.abs(curr - currentAngle) < Math.abs(prev - currentAngle) ? curr : prev;
            });
            
            //  console.log("sensorsys cur close", currentAngle, closestAngle)

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
                        //console.log("sensorsys x y", x, y);
                        image.setPosition(x, y);
                        image.setVisible(true);
                    } else {
                        image.setVisible(false);
                    }
                });
            });
        });*/
    }

    protected onEntityCreated(entity: Entity): void {
        const sensors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];
        sensors.forEach(sensor => {
            this.addSensorObject(entity, sensor);

            sensor.maxSpeed.onChange(value => {
                this.removeSensorObject(sensor);
                this.addSensorObject(entity, sensor);
            });

            sensor.defaultSpeed.onChange(value => {
                this.removeSensorObject(sensor);
                this.addSensorObject(entity, sensor);
            });
            console.log("motorsys test", sensor);

        });
    }

    protected onEntityDestroyed(entity: Entity): void {
        const sensors = entity.getMultipleComponents(ComponentType.MOTOR) as MotorComponent[];
        sensors.forEach(sensor => {
            this.removeSensorObject(sensor);
        });
    }

    protected onEntityComponentAdded(entity: Entity, component: Component): void {
        if (component.name !== ComponentType.MOTOR) return;

        const sensor = component as MotorComponent;
        this.addSensorObject(entity, sensor);

        sensor.maxSpeed.onChange(value => {
            this.removeSensorObject(sensor);
            this.addSensorObject(entity, sensor);
        });

        sensor.defaultSpeed.onChange(value => {
            this.removeSensorObject(sensor);
            this.addSensorObject(entity, sensor);
        });
    }

    protected onEntityComponentRemoved(entity: Entity, component: Component): void {
        if (component.name !== ComponentType.MOTOR) return;

        this.removeSensorObject(component as MotorComponent);
    }

    private addSensorObject(entity: Entity, sensor: MotorComponent): void {
        const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;


        /*const textures: { [compId: number]: Phaser.GameObjects.Image } = {};
        
        
            const texture = this.scene.textures.createCanvas(`sensor_texture_${sensor.id}`,8, 50);
            const context = texture.getContext();
           
            // zeichnet die Sensoren auf dem Canvas
            for (let y = 0; y < 5; y += 1) {
                for (let x = 0; x < 5; x += 1) {
                   
                    context.fillStyle = `rgba(50, 50, 100, 1})`;
                    context.fillRect(x, y, 8, 50);
                }
            }

            // window.open(offScreenCanvas.toDataURL(), '_blank');
            // window.open(offScreenCanvasDown.toDataURL(), '_blank');

            texture.refresh();

            const x = transform.position.get().x + sensor.position.get().x;
            const y = transform.position.get().y + sensor.position.get().y;
            const image = this.scene.add.image(x, y, `sensor_texture_${sensor.id}`);
            image.setScale(CORRELATION_SCALE);
            // image.setBlendMode(Phaser.BlendModes.SCREEN);
            image.setVisible(false);
            image.setDepth(99);
            this.scene.children.bringToTop(image);

            //textures[sensor.id] = image;
           
        

        //  console.log("sensorsystem textures", textures);
        this.textures[sensor.id] = image;*/
        const x = transform.position.get().x + sensor.position.get().x;
        const y = transform.position.get().y + sensor.position.get().y;
        this.scene.add.circle(x,y, 10, 'black', 1).setOrigin(1);

        console.log("motorsys textures ", this.textures[sensor.id]);

        /*EventBus.publish(EventType.MOTOR_CREATED, {
          id: sensor.id,
          type: sensor.reactsTo.get(),
          values,
          width,
          height,
        });*/
    }

    private removeSensorObject(sensor: MotorComponent): void {
        const angleTextures = this.textures[sensor.id];

        Object.keys(angleTextures).forEach(key => {
            this.scene.textures.remove(`sensor_texture_${sensor.id}`);
        });

        delete this.textures[sensor.id];

        /*EventBus.publish(EventType.SENSOR_DESTROYED, {
          id: sensor.id,
          type: sensor.reactsTo.get(),
        });*/
    }
}
