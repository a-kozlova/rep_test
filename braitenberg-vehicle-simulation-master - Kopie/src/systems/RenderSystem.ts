import Phaser from 'phaser';
import System from './System';
import Entity from '../Entity';
import { ComponentType, EventType } from '../enums';
import RenderComponent from '../components/RenderComponent';
import TransformableComponent from '../components/TransformableComponent';
import EventBus from '../EventBus';
import SolidBodyComponent from '../components/SolidBodyComponent';
import Component from '../components/Component';

import EntityManager from '../EntityManager';



interface RenderObjectDictionary {
  [entityId: number]: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
}

export default class RenderSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.RENDER];

  private renderObjects: RenderObjectDictionary = {};

  private selected: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null = null;

  private deleteBtn: Phaser.GameObjects.Graphics | null = null;

  private direction: Phaser.GameObjects.Graphics | null = null;

  public constructor(scene: Phaser.Scene) {
    super(scene);

    EventBus.subscribe(EventType.ENTITY_SELECTED, (entity: Entity) => {
      this.removeHighlight();
      this.highlight(entity);
      });

      document.addEventListener("closeSettings", () => {
          this.removeHighlight();
      });
  }

  private highlight(entity: Entity): void {
    const image = this.renderObjects[entity.id];
    if (image) {
      this.selected = image;
      this.selected.setData('originalDepth', image.depth);
      this.selected.setDepth(999);

      /*if (image instanceof Phaser.GameObjects.Image) {
        image.setTint(0xddddff);
      }

      if (image instanceof Phaser.GameObjects.Rectangle) {
        this.selected.setData('originalColor', image.fillColor);
        image.setFillStyle(0xddddff);
      }*/
        
      }
      if (entity) {
          const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
          const render = entity.getComponent(ComponentType.RENDER) as RenderComponent;
		 let img = this.scene.add.graphics();
          img.fillCircle(transform.position.get().x - render.size.get().width,
              transform.position.get().y - render.size.get().width,
              10);
          img.fillStyle(0x000000, 1);

          //INTERACTIVE?????????????????????????????????????
          img.setInteractive(new Phaser.Geom.Circle(transform.position.get().x - 100, transform.position.get().y - 100, 10), Phaser.Geom.Circle.Contains);
          img.on('pointerdown', () => {
              EntityManager.destroyEntity(entity.id);
          });
          
          this.deleteBtn = img;
      }
      
  }

  private removeHighlight(): void {
    if (this.selected && this.scene.children.exists(this.selected)) {
      if (this.selected instanceof Phaser.GameObjects.Image) {
        //this.selected.setTint(0xffffff);
      }
      if (this.selected instanceof Phaser.GameObjects.Rectangle) {
        const color = this.selected.getData('originalColor') || 0xcccccc;
        //this.selected.setFillStyle(color);
      }
      this.selected.setDepth(this.selected.getData('originalDepth') || 0);
    }
      this.selected = null;
      if (this.deleteBtn) {
        this.deleteBtn.clear();
      }
      
  }

  public update(): void {
    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const renderObject = this.renderObjects[entity.id];

      //  console.log("render sys trangsf set", transform.position.get().x, transform.position.get().y);
      renderObject.setPosition(transform.position.get().x, transform.position.get().y);
      renderObject.setRotation(transform.angle.get());

        if (this.direction) {
            const dir = this.direction.clear();

            const bodyPosition = transform.position.get();
            const dirOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: 0, y:200 },
                transform.angle.get(),
            );
            //console.log("diroffset", dirOffset);
            const x = bodyPosition.x + dirOffset.x;
            const y = bodyPosition.y + dirOffset.y;

            dir.lineStyle(2, 0x000000, 1);
            dir.fillStyle(0x000000, 1);
            dir.fillTriangle(x, y, x - 5, y - 5, x + 5, y - 5);
            dir.strokeTriangle(x, y, x - 5, y - 5, x + 5, y - 5);
            dir.setAngle(180);
        }
        
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
   // if ((body && typeof render.asset.get() === 'number') || typeof render.asset.get() === 'number') {
      const renderHeight = render.size.get().height === 0 ? render.size.get().width : render.size.get().height;
      image = this.scene.add.rectangle(
        transform.position.get().x,
        transform.position.get().y,
        body ? body.size.get().width : render.size.get().width,
        body ? body.size.get().height : renderHeight,
        
      );
      image.setStrokeStyle(10, render.asset.get() as number)
   /* } else {
      image = this.scene.add.image(
        transform.position.get().x,
        transform.position.get().y,
        render.asset.get() as string,
      );
      const scaleX = render.size.get().width / image.width;
      const scaleY = render.size.get().height === 0 ? scaleX : render.size.get().height / image.height;
        image.setScale(scaleX, scaleY);  
    }*/
      console.log("render sys", image);
     

      if (render.blendMode.get()) {
      image.setBlendMode(render.blendMode.get() as Phaser.BlendModes);
      }

      const direction = this.scene.add.graphics();

      const bodyPosition = transform.position.get();
      const dirOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
          { x: 0, y: 200 },
          transform.angle.get(),
      );
      console.log("diroffset angle", dirOffset,transform.angle.get(), entity);
      const x = bodyPosition.x + dirOffset.x;
      const y = bodyPosition.y + dirOffset.y;

      direction.lineStyle(2, 0x000000, 1);
      direction.fillStyle(0x000000, 1);
      direction.fillTriangle(x, y, x - 5, y - 10, x + 5, y - 10);
      direction.strokeTriangle(x, y, x - 5, y - 10, x + 5, y - 10);
      //direction.setAngle(180);
      this.direction = direction;
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
