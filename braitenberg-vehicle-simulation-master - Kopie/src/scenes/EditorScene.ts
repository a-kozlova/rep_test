import Phaser from 'phaser';
import Entity from '../Entity';
import EntityManager from '../EntityManager';
import { SubstanceType, EmissionType, BodyShape } from '../enums';

import SolidBodyComponent from '../components/SolidBodyComponent';
import RenderComponent from '../components/RenderComponent';
import MotorComponent from '../components/MotorComponent';
import SensorComponent from '../components/SensorComponent';
import SourceComponent from '../components/SourceComponent';
import TransformableComponent from '../components/TransformableComponent';
import ConnectionComponent from '../components/ConnectionComponent';

import SidebarScene from './SidebarScene';

type DropHandler = (position: { x: number; y: number }) => void;

export default class EditorScene extends SidebarScene {
  public constructor() {
    super('EditorScene');
  }

  public onCreate(container: Phaser.GameObjects.Container): void {
    const prefabBlank = this.add.image(0, 0, 'prefab-blank').setFlipY(true);
    const prefabSource = this.add.image(0, 0, 'prefab-source');
    const prefab2a = this.add.image(0, 0, 'prefab-2a').setFlipY(true);
    const prefab2b = this.add.image(0, 0, 'prefab-2b').setFlipY(true);
    const prefab3a = this.add.image(0, 0, 'prefab-3a').setFlipY(true);
    const prefab3b = this.add.image(0, 0, 'prefab-3b').setFlipY(true);

    this.makeInteractable(prefabBlank, position => {
      EntityManager.createEntity(
        // In der Simulations-Welt ist Grad 0 nach unten zeigend, damit die Entität,
        // wie auf der Vorlage, nach oben zeigt, wird die einmal um 180° gedreht.
        new TransformableComponent({ position, angle: Math.PI }),
        new RenderComponent({ asset: 'prefab-blank', size: 100 }),
      );
    });

    // Fügt der Standard Quelle die erwarteten Eigenschaften hinzu
    this.makeInteractable(prefabSource, position => {
      EntityManager.createEntity(
        new TransformableComponent({ position }),
        new SourceComponent({
          range: 100,
        }),
        new RenderComponent({ asset: 'prefab-source', size: 100 }),
      );
    });

    // Fügt das von Braitenberg als Vehikel 2a bezeichnete Gefährt
    // mit 2 Sensoren und 2 direkt verbundenen Motoren hinzu
    // Das Vehikel fährt von Lichtquellen weg
    this.makeInteractable(prefab2a, position => {
      const entity = new Entity();
      const transform = new TransformableComponent({
        position,
        angle: Math.PI,
      });
      entity.addComponent(transform);
      entity.addComponent(
        new SolidBodyComponent({
          size: { width: 100, height: 150 },
        }),
      );
      entity.addComponent(
        new RenderComponent({
          asset: 'vehicle',
          size: 100,
        }),
      );
      const motor1 = entity.addComponent(
        new MotorComponent({
          position: { x: -50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const motor2 = entity.addComponent(
        new MotorComponent({
          position: { x: 50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const sensor1 = entity.addComponent(
        new SensorComponent({
          position: { x: -50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      const sensor2 = entity.addComponent(
        new SensorComponent({
          position: { x: 50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      entity.addComponent(
        new ConnectionComponent({
          inputIds: [sensor1, sensor2],
          outputIds: [motor1, motor2],
          weights: [[1, 0], [0, 1]],
        }),
      );
      EntityManager.addExistingEntity(entity);
    });

    // Fügt das von Braitenberg als Vehikel 2b bezeichnete Gefährt
    // mit 2 Sensoren und 2 überkreutz verbundenen Motoren hinzu
    // Das Gefährt fährt auf Lichtquellen zu
    this.makeInteractable(prefab2b, position => {
      const entity = new Entity();
      const transform = new TransformableComponent({
        position,
        angle: Math.PI,
      });
      transform.angle.set(-Math.PI / 2);
      entity.addComponent(transform);
      entity.addComponent(
        new SolidBodyComponent({
          size: { width: 100, height: 150 },
        }),
      );
      entity.addComponent(
        new RenderComponent({
          asset: 'vehicle',
          size: 100,
        }),
      );
      const motor1 = entity.addComponent(
        new MotorComponent({
          position: { x: -50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const motor2 = entity.addComponent(
        new MotorComponent({
          position: { x: 50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const sensor1 = entity.addComponent(
        new SensorComponent({
          position: { x: -50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      const sensor2 = entity.addComponent(
        new SensorComponent({
          position: { x: 50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      entity.addComponent(
        new ConnectionComponent({
          inputIds: [sensor1, sensor2],
          outputIds: [motor1, motor2],
          weights: [[0, 1], [1, 0]],
        }),
      );
      EntityManager.addExistingEntity(entity);
    });

    // Fügt das von Braitenberg als Vehikel 3a bezeichnete Gefährt
    // mit 2 Sensoren und 2 gerade verbundenen Motoren hinzu,
    // die Motoren sind negativ verschaltet
    // Das Gefährt fährt langsam auf die Lichtquellen zu
    this.makeInteractable(prefab3a, position => {
      const entity = new Entity();
      const transform = new TransformableComponent({
        position,
        angle: Math.PI,
      });
      transform.angle.set(-Math.PI / 2);
      entity.addComponent(transform);
      entity.addComponent(
        new SolidBodyComponent({
          size: { width: 100, height: 150 },
        }),
      );
      entity.addComponent(
        new RenderComponent({
          asset: 'vehicle',
          size: 100,
        }),
      );
      const motor1 = entity.addComponent(
        new MotorComponent({
          position: { x: -50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const motor2 = entity.addComponent(
        new MotorComponent({
          position: { x: 50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const sensor1 = entity.addComponent(
        new SensorComponent({
          position: { x: -50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      const sensor2 = entity.addComponent(
        new SensorComponent({
          position: { x: 50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      entity.addComponent(
        new ConnectionComponent({
          inputIds: [sensor1, sensor2],
          outputIds: [motor1, motor2],
          weights: [[-1, 0], [0, -1]],
        }),
      );
      EntityManager.addExistingEntity(entity);
    });

    // Fügt das von Braitenberg als Vehikel 3b bezeichnete Gefährt
    // mit 2 Sensoren und 2 ueberkreuz verbundenen Motoren hinzu,
    // die Motoren sind negativ verschaltet
    // Das Gefährt fährt auf langsam auf die Lichtquellen zu
    this.makeInteractable(prefab3b, position => {
      const entity = new Entity();
      const transform = new TransformableComponent({
        position,
        angle: Math.PI,
      });
      transform.angle.set(-Math.PI / 2);
      entity.addComponent(transform);
      entity.addComponent(
        new SolidBodyComponent({
          size: { width: 100, height: 150 },
        }),
      );
      entity.addComponent(
        new RenderComponent({
          asset: 'vehicle',
          size: 100,
        }),
      );
      const motor1 = entity.addComponent(
        new MotorComponent({
          position: { x: -50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const motor2 = entity.addComponent(
        new MotorComponent({
          position: { x: 50, y: 0 },
          maxSpeed: 30,
          defaultSpeed: 1,
        }),
      );
      const sensor1 = entity.addComponent(
        new SensorComponent({
          position: { x: -50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      const sensor2 = entity.addComponent(
        new SensorComponent({
          position: { x: 50, y: 75 },
          range: 20,
          angle: 0.4,
        }),
      );
      entity.addComponent(
        new ConnectionComponent({
          inputIds: [sensor1, sensor2],
          outputIds: [motor1, motor2],
          // TO-DO Negative Verknüpfung umsetzen
          weights: [[0, -1], [-1, 0]],
        }),
      );
      EntityManager.addExistingEntity(entity);
    });

    this.pack([prefabBlank, prefabSource, prefab2a, prefab2b, prefab3a, prefab3b]);
  }

  private makeInteractable(image: Phaser.GameObjects.Image, onDrop: DropHandler): void {
    image.setInteractive({ draggable: true });
    image.on('dragstart', () => {
      this.children.bringToTop(image);
    });

    image.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
      image.setPosition(x, y);
    });

    image.on('dragend', (pointer: Phaser.Input.Pointer, x: number, y: number, dropped: boolean) => {
      if (this.container) {
        const position = { x: 0, y: 0 };
        this.container.getWorldTransformMatrix().transformPoint(image.x, image.y, position);
        onDrop(position);
      }
      image.setPosition(image.input.dragStartX, image.input.dragStartY);
    });
  }
}
