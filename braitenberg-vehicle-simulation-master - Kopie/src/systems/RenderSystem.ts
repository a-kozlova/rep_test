import Phaser from 'phaser';
import System from './System';
import Entity from '../Entity';
import { ComponentType, EventType } from '../enums';
import RenderComponent from '../components/RenderComponent';
import TransformableComponent from '../components/TransformableComponent';
import EventBus from '../EventBus';
import SolidBodyComponent from '../components/SolidBodyComponent';
import Component from '../components/Component';

interface RenderObjectDictionary {
  [entityId: number]: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
}

export default class RenderSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.RENDER];

  private renderObjects: RenderObjectDictionary = {};

  private selected: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null = null;

  public constructor(scene: Phaser.Scene) {
    super(scene);

    EventBus.subscribe(EventType.ENTITY_SELECTED, (entity: Entity) => {
      this.removeHighlight();
      this.highlight(entity);
    });

    EventBus.subscribe(EventType.SIDEBAR_CLOSED, () => {
      this.removeHighlight();
    });
  }

  private highlight(entity: Entity): void {
    const image = this.renderObjects[entity.id];
    if (image) {
      this.selected = image;
      this.selected.setData('originalDepth', image.depth);
      this.selected.setDepth(999);

      if (image instanceof Phaser.GameObjects.Image) {
        image.setTint(0xddddff);
      }

      if (image instanceof Phaser.GameObjects.Rectangle) {
        this.selected.setData('originalColor', image.fillColor);
        image.setFillStyle(0xddddff);
      }
    }
  }

  private removeHighlight(): void {
    if (this.selected && this.scene.children.exists(this.selected)) {
      if (this.selected instanceof Phaser.GameObjects.Image) {
        this.selected.setTint(0xffffff);
      }
      if (this.selected instanceof Phaser.GameObjects.Rectangle) {
        const color = this.selected.getData('originalColor') || 0xcccccc;
        this.selected.setFillStyle(color);
      }
      this.selected.setDepth(this.selected.getData('originalDepth') || 0);
    }
    this.selected = null;
  }

  public update(): void {
    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const renderObject = this.renderObjects[entity.id];

      renderObject.setPosition(transform.position.get().x, transform.position.get().y);
      renderObject.setRotation(transform.angle.get());
    });
  }

  protected onEntityCreated(entity: Entity): void {
    const render = entity.getComponent(ComponentType.RENDER) as RenderComponent;

    render.asset.onChange(value => {
      this.onEntityDestroyed(entity);
      this.createImage(entity, render);
    });

    render.size.onChange(value => {
      const image = this.renderObjects[entity.id];
      const scaleX = value.width / image.width;
      const scaleY = value.height === 0 ? scaleX : value.height / image.height;
      image.setScale(scaleX, scaleY);
    });

    this.createImage(entity, render);
  }

  protected createImage(entity: Entity, render: RenderComponent): void {
    const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
    const body = entity.getComponent(ComponentType.SOLID_BODY) as SolidBodyComponent;

    let image: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if ((body && typeof render.asset.get() === 'number') || typeof render.asset.get() === 'number') {
      const renderHeight = render.size.get().height === 0 ? render.size.get().width : render.size.get().height;
      image = this.scene.add.rectangle(
        transform.position.get().x,
        transform.position.get().y,
        body ? body.size.get().width : render.size.get().width,
        body ? body.size.get().height : renderHeight,
        render.asset.get() as number,
      );
    } else {
      image = this.scene.add.image(
        transform.position.get().x,
        transform.position.get().y,
        render.asset.get() as string,
      );
      const scaleX = render.size.get().width / image.width;
      const scaleY = render.size.get().height === 0 ? scaleX : render.size.get().height / image.height;
      image.setScale(scaleX, scaleY);
    }

    if (render.blendMode.get()) {
      image.setBlendMode(render.blendMode.get() as Phaser.BlendModes);
    }

    // Alles was man rendert, kann man auch verschieben. Macht es trotzdem
    // vielleicht Sinn eine eigene "DraggableComponent" zu erzeugen und
    // nur anhand dessen ein Objekt draggable zu machen oder nicht?
    image.setInteractive({ draggable: true, useHandCursor: true });
    image.on('drag', (gameObject: unknown, x: number, y: number) => {
      transform.position.set({ x, y });
    });

    image.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dragThreshold = 1;
      if (pointer.getDistance() > dragThreshold) {
        return;
      }
      EventBus.publish(EventType.ENTITY_SELECTED, entity);
    });

    this.renderObjects[entity.id] = image;
  }

  protected onEntityDestroyed(entity: Entity): void {
    const render = this.renderObjects[entity.id];

    render.destroy();
    delete this.renderObjects[entity.id];
  }

  // falls die neu hinzugefügte Komponente  nicht die Render Komponente ist
  // wird in die Method onEntity Created aufgerufen um ein neues Entity zu erstellen
  protected onEntityComponentAdded(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.RENDER) return;

    this.onEntityCreated(entity);
  }

  // falls die zu Entfernende nicht die Render Komponente ist
  // wird in die Method onEntityDestroyed aufgerufen um das Entity zu zerstören
  protected onEntityComponentRemoved(entity: Entity, component: Component): void {
    if (component.name !== ComponentType.RENDER) return;

    this.onEntityDestroyed(entity);
  }
}
