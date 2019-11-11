import Phaser from 'phaser';
import { pickBy } from 'lodash-es';
import System from './System';
import Entity from '../Entity';
import { ComponentType, BodyShape, EventType } from '../enums';
import SolidBodyComponent from '../components/SolidBodyComponent';
import TransformableComponent from '../components/TransformableComponent';
import EventBus from '../EventBus';
import Component from '../components/Component';

interface PhysicsObjectDictionary {
  [entityId: number]: {
    body: Phaser.Physics.Matter.Matter.Body;
    eventBeforeUpdate: Function;
    eventAfterUpdate: Function;
  };
}

export default class PhysicsSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.SOLID_BODY];

  private physicsObjects: PhysicsObjectDictionary = {};

  private bodiesGraphic: Phaser.GameObjects.Graphics;

  public constructor(scene: Phaser.Scene) {
    super(scene);

    EventBus.subscribe(EventType.APPLY_FORCE, this.applyForce.bind(this));

    this.bodiesGraphic = this.scene.sys.add.graphics({ x: 0, y: 0 });
    this.bodiesGraphic.setDepth(Number.MAX_VALUE);
  }

  public update(): void {
    this.renderBodies();
  }

  private renderBodies(): void {
    this.bodiesGraphic.clear();

    const graphics = this.bodiesGraphic;
    const bodies = Object.values(this.physicsObjects);
    const bodyColor = 0x999999;

    let body;
    let part;

    for (let i = 0; i < bodies.length; i += 1) {
      ({ body } = bodies[i]);

      if (!body.render.visible) {
        continue;
      }

      //  Handle compound parts
      for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k += 1) {
        part = body.parts[k];

        if (!part.render.visible) {
          continue;
        }

        graphics.lineStyle(1, bodyColor, part.render.opacity);
        graphics.fillStyle(bodyColor, part.render.opacity);

        //  Part polygon
        if (part.circleRadius) {
          graphics.beginPath();
          graphics.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
        } else {
          graphics.beginPath();
          graphics.moveTo(part.vertices[0].x, part.vertices[0].y);

          const vertLength = part.vertices.length;

          for (let j = 1; j < vertLength; j += 1) {
            if (!part.vertices[j - 1].isInternal) {
              graphics.lineTo(part.vertices[j].x, part.vertices[j].y);
            } else {
              graphics.moveTo(part.vertices[j].x, part.vertices[j].y);
            }

            if (part.vertices[j].isInternal) {
              graphics.moveTo(
                part.vertices[(j + 1) % part.vertices.length].x,
                part.vertices[(j + 1) % part.vertices.length].y,
              );
            }
          }

          graphics.lineTo(part.vertices[0].x, part.vertices[0].y);
          graphics.closePath();
        }
        graphics.strokePath();
      }
    }
  }

  protected onEntityCreated(entity: Entity): void {
    const component = entity.getComponent(ComponentType.SOLID_BODY) as SolidBodyComponent;
    component.shape.onChange(value => {
      this.onEntityDestroyed(entity);
      this.createBody(entity, component);
    });

    component.size.onChange((value, old) => {
      const { body } = this.physicsObjects[entity.id];
      // Hier wird der Körper einmal in die "aufrechte" Position gedreht, weil `Matter.Body.scale`
      // den Körper aus der "globalen" Sicht skaliert. D.h. sind scaleX und scaleY unterschied-
      // lich, dann wird der Körper gequetscht und zu einem Parallelogramm.
      Phaser.Physics.Matter.Matter.Body.rotate(body, -body.angle);
      Phaser.Physics.Matter.Matter.Body.scale(body, value.width / old.width, value.height / old.height);
      // Da wir den Körper vorher gedreht haben, muss er auch wieder in die Ausgangsdrehung
      // gebracht werden.
      Phaser.Physics.Matter.Matter.Body.rotate(body, body.angle);
    });

    component.isStatic.onChange(value => {
      this.physicsObjects[entity.id].body.isStatic = value;
    });

    this.createBody(entity, component);
  }

  private createBody(entity: Entity, component: SolidBodyComponent): void {
    const body = PhysicsSystem.getBody(component);

    const emitters = this.attachSynchronization(body, entity);

    this.scene.matter.world.add(body);
    this.physicsObjects[entity.id] = {
      body,
      eventBeforeUpdate: emitters[0],
      eventAfterUpdate: emitters[1],
    };
  }

  protected onEntityDestroyed(entity: Entity): void {
    const { body, eventBeforeUpdate, eventAfterUpdate } = this.physicsObjects[entity.id];

    this.scene.matter.world.off('beforeupdate', eventBeforeUpdate);
    this.scene.matter.world.off('afterupdate', eventAfterUpdate);
    this.scene.matter.world.remove(body, false);
    delete this.physicsObjects[entity.id];
  }

  // überprüft ob fälschlicherweise eine zweite Körper Komponente hinzugefügt wurde,
  // falls nicht wird die onEntityCreated aufgerufen, um die Funktionen auch auf den
  // neu hinzugefügten Komponenten anzuwenden
  protected onEntityComponentAdded(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.SOLID_BODY) return;

    this.onEntityCreated(entity);
  }

  // überprüft ob fälschlicherweise die Körper Komponente gelöscht wurde,
  // falls nicht wird die onEntityDestroyed aufgerufen
  protected onEntityComponentRemoved(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.SOLID_BODY) return;

    this.onEntityDestroyed(entity);
  }

  // liefert den festen Körper der Entität zurück
  private static getBody(component: SolidBodyComponent): Phaser.Physics.Matter.Matter.Body {
    switch (component.shape.get()) {
      case BodyShape.CIRCLE: {
        const options: Phaser.Physics.Matter.Matter.IBodyDefinition = {
          friction: 0.1,
          frictionAir: 0.3,
          isStatic: component.isStatic.get(),
        };
        return Phaser.Physics.Matter.Matter.Bodies.circle(
          0,
          0,
          component.size.get().width,
          pickBy(options, v => v !== undefined),
        );
      }
      case BodyShape.RECTANGLE:
      default: {
        const options: Phaser.Physics.Matter.Matter.IBodyDefinition = {
          friction: 0.7,
          frictionAir: 0.6,
          isStatic: component.isStatic.get(),
        };
        return Phaser.Physics.Matter.Matter.Bodies.rectangle(
          0,
          0,
          component.size.get().width,
          component.size.get().height,
          pickBy(options, v => v !== undefined),
        );
      }
    }
  }

  private attachSynchronization(body: Phaser.Physics.Matter.Matter.Body, entity: Entity): Function[] {
    const component = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;

    const onBefore = (): void => {
      Phaser.Physics.Matter.Matter.Body.setPosition(body, component.position.get());
      Phaser.Physics.Matter.Matter.Body.setAngle(body, component.angle.get());
    };
    this.scene.matter.world.on('beforeupdate', onBefore);

    const onAfter = (): void => {
      component.position.set(body.position);
      component.angle.set(body.angle);
    };
    this.scene.matter.world.on('afterupdate', onAfter);

    return [onBefore, onAfter];
  }

  private applyForce(payload: EventMessages.ApplyForce): void {
    if (!this.physicsObjects[payload.id]) return;

    const { body } = this.physicsObjects[payload.id];

    if (!body) return;

    const { offset, force } = payload;

    const V = Phaser.Physics.Matter.Matter.Vector;
    const t = V.cross(V.neg(offset), force);

    // Das Drehmoment wird hier manuell berechnet, da `applyForce` nicht selbstständig
    // das Drehmoment berechnet. Die Formel stimmt nicht mit der Realität überein,
    // fühlt sich in der Simulation besser an, da das Vehikel schneller zur bzw.
    // weg von der Quelle dreht.
    // Die Potenz sorgt dafür, dass kleinere Drehungen mehr Drehmoment erzeugen und das
    // Vehikel sich dadurch eher dreht. Es ist wichtig eine ungerade Potenz zu nehmen,
    // damit entgegengesetztes Drehmoment die Rotatioin ausgleicht.
    body.torque -= (t + Math.sign(t)) ** 5;

    // console.log(body.torque, t);

    Phaser.Physics.Matter.Matter.Body.applyForce(
      body,
      { x: body.position.x + offset.x, y: body.position.y + offset.y },
      force,
    );
  }
}
