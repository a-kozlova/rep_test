import Phaser from 'phaser';
import System from './System';
import Entity from '../Entity';
import { ComponentType, EventType, BodyShape } from '../enums';
import RenderComponent from '../components/RenderComponent';
import TransformableComponent from '../components/TransformableComponent';
import EventBus from '../EventBus';
import SolidBodyComponent from '../components/SolidBodyComponent';
import SourceComponent from '../components/SourceComponent';
import Component from '../components/Component';
import EntityManager from '../EntityManager';

interface RenderObjectDictionary {
  [entityId: number]: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
}

export default class RenderSystem extends System {
  public expectedComponents: ComponentType[] = [ComponentType.TRANSFORMABLE, ComponentType.RENDER];

  private renderObjects: RenderObjectDictionary = {};

  private selected: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null = null;

  private deleteBtn: Phaser.GameObjects.Image | null = null;
  private rotateBtn: Phaser.GameObjects.Image | null = null;

  private selectedId: number | null = null;

  private direction: { [entityId: number]: Phaser.GameObjects.Graphics } = {};


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
      this.selectedId = entity.id;

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

      const offsetX = render.shape.get() === 'Kreis' ? -render.size.get().width / 2: -render.size.get().width;
      const deleteBtnOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
              { x: offsetX - 15, y: render.size.get().width},
            transform.angle.get());

        const rotateBtnOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
            { x: -render.size.get().width - 15, y: -render.size.get().width },
            transform.angle.get());
        
        let imgDel = this.scene.add.image(transform.position.get().x - deleteBtnOffset.x,
            transform.position.get().y - deleteBtnOffset.y, 'del');
        imgDel.setScale(0.04, 0.04);
        imgDel.setDepth(999);       
           
        imgDel.setInteractive( { useHandCursor: true }).on('pointerdown', () => {
                 if (confirm("Delete this entity?")) {
                     EntityManager.destroyEntity(entity.id);
                 }
        });

        let imgRotate = this.scene.add.image(transform.position.get().x - rotateBtnOffset.x,
            transform.position.get().y - rotateBtnOffset.y, 'rotate');
        imgRotate.setScale(0.08, 0.08);
        imgRotate.setDepth(999);

        imgRotate.setInteractive({ useHandCursor: true }).on('drag', (gameObject: unknown) => {
            //transform.angle.set();
        });

        imgRotate.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            /*const dragThreshold = 1;
            if (pointer.getDistance() > dragThreshold) {
                return;
            }
            EventBus.publish(EventType.ENTITY_SELECTED, entity);*/
        });
		let radius = Math.sqrt((transform.position.get().x - rotateBtnOffset.x)*(transform.position.get().x - rotateBtnOffset.x) +
					 (transform.position.get().y- rotateBtnOffset.y)*(transform.position.get().y - rotateBtnOffset.y));
					 console.log(radius);

		 this.scene.plugins.get('rexdragrotateplugin').add(this.scene, {
				x: transform.position.get().x,
				y: transform.position.get().y,
				maxRadius: radius+5,
				minRadius: radius-5,
				// enable: true,
			})
		.on('drag', function (dragRotate) {
			imgRotate.rotation += dragRotate.deltaRotation;
			this.renderObjects[entity.id].rotation += dragRotate.deltaRotation;
        })
       
        this.deleteBtn = imgDel;
        this.rotateBtn = imgRotate;
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
          this.deleteBtn.setVisible(false);
          this.deleteBtn.removeInteractive();
          this.selectedId = null;
      }

      if (this.rotateBtn) {
          this.rotateBtn.setVisible(false);
          this.rotateBtn.removeInteractive();
      }      
  }

  public update(): void {
    this.entities.forEach(entity => {
      const transform = entity.getComponent(ComponentType.TRANSFORMABLE) as TransformableComponent;
      const renderObject = this.renderObjects[entity.id];

      renderObject.setPosition(transform.position.get().x, transform.position.get().y);
      renderObject.setRotation(transform.angle.get());

      const render = entity.getComponent(ComponentType.RENDER) as RenderComponent;
      const renderHeight = render.size.get().height === 0 ? render.size.get().width : render.size.get().height;

        if (this.direction) {
            const dir = this.direction[entity.id];
            dir.clear();
                       
            const bodyPosition = transform.position.get();
            const dirOffset1 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: 0, y: renderHeight / 2 - 5 },
                transform.angle.get(),
            );
            const dirOffset2 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: -10, y: renderHeight / 2 - 15 },
                transform.angle.get(),
            );
            const dirOffset3 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: 10, y: renderHeight / 2 - 15 },
                transform.angle.get(),
            );
                       
            const x1 = bodyPosition.x + dirOffset1.x;
            const y1 = bodyPosition.y + dirOffset1.y;
            const x2 = bodyPosition.x + dirOffset2.x;
            const y2 = bodyPosition.y + dirOffset2.y;
            const x3 = bodyPosition.x + dirOffset3.x;
            const y3 = bodyPosition.y + dirOffset3.y;

            dir.lineStyle(2, 0x000000, 1);
            dir.fillStyle(0x000000, 1);
            dir.fillTriangle(x1, y1, x2, y2, x3, y3);
            dir.strokeTriangle(x1, y1, x2, y2, x3, y3);
        }

        if (this.selectedId === entity.id) {
            
            if (this.deleteBtn) {
                const del = this.deleteBtn;
               
                const deleteBtnOffset = Phaser.Physics.Matter.Matter.Vector.rotate(
                    { x: -render.size.get().width - 15, y: render.size.get().width },
                    transform.angle.get());                                
            
                /* ????????????????????????????????????????????????????????????????????????????????????????????????????
                * Wenn dieser Code eingesetzt wird, wird die Position des Buttons richtig berechnet und gezeichnet, 
                * der Button reagiert aber nur in dem Punkt, der ursprünglich in setIneraktive() übergeben wurde
                
               del.clear();
               del.lineStyle(3, 0x000000, 1);
                del.strokeCircle(transform.position.get().x - deleteBtnOffset.x,
                    transform.position.get().y - deleteBtnOffset.y,
                    10);

                del.lineBetween(transform.position.get().x - deleteBtnOffset.x - 5,
                    transform.position.get().y - deleteBtnOffset.y - 5, transform.position.get().x - deleteBtnOffset.x + 5,
                    transform.position.get().y - deleteBtnOffset.y + 5);
                del.lineBetween(transform.position.get().x - deleteBtnOffset.x - 5,
                    transform.position.get().y - deleteBtnOffset.y + 5, transform.position.get().x - deleteBtnOffset.x + 5,
                    transform.position.get().y - deleteBtnOffset.y - 5);
                */
                
                // ????????????????????????????????????????????????????????????????????????????????????????????????????
                // Bei diesem Code wird Position falsch gesetzt, obwohl Koordinaten richtig berechnet werden
                // Außerdem wird die Position neu berechnet bei jedem weiterem Aufruf der Funktion highlight()
                del.setPosition(transform.position.get().x - deleteBtnOffset.x,
                    transform.position.get().y - deleteBtnOffset.y);
            }  
        }        
    });
  }

  protected onEntityCreated(entity: Entity): void {
    const render = entity.getComponent(ComponentType.RENDER) as RenderComponent;

    render.asset.onChange(value => {
      this.onEntityDestroyed(entity);
      this.createImage(entity, render);
    });

    render.shape.onChange(value => {
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
		const source = entity.getComponent(ComponentType.SOURCE) as SourceComponent;

        let image: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Arc;
        if (render) {
            const renderHeight = render.size.get().height === 0 ? render.size.get().width : render.size.get().height;
            if (render.shape.get() === BodyShape.RECTANGLE) {
                /* image = this.scene.add.circle(
                     transform.position.get().x,
                     transform.position.get().y,
                     100);
                 image.setStrokeStyle(10, render.asset.get() as number) 
            */
                image = this.scene.add.rectangle(
                    transform.position.get().x,
                    transform.position.get().y,
                    body ? body.size.get().width : render.size.get().width,
                    body ? body.size.get().height : renderHeight,
                );
            } else {
                image = this.scene.add.ellipse(
                    transform.position.get().x ,
                    transform.position.get().y ,
                    render.size.get().width,
                    render.size.get().width,                    
                );
                //image.setDisplayOrigin(0, 0);
            }
            image.setStrokeStyle(5, render.asset.get() as number)
           
            if (render.blendMode.get()) {
                image.setBlendMode(render.blendMode.get() as Phaser.BlendModes);
            }
			if(source.range.get() !=0 && source.emissionType.get() == "GAUSSIAN") {
				image.setDepth(100);			
			}

            const direction = this.scene.add.graphics();

            const bodyPosition = transform.position.get();
            const dirOffset1 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: 0, y: renderHeight / 2 - 5 },
                transform.angle.get(),
            );
            const dirOffset2 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: -10, y: renderHeight / 2 - 15 },
                transform.angle.get(),
            );
            const dirOffset3 = Phaser.Physics.Matter.Matter.Vector.rotate(
                { x: 10, y: renderHeight / 2 - 15 },
                transform.angle.get(),
            );

            const x1 = bodyPosition.x + dirOffset1.x;
            const y1 = bodyPosition.y + dirOffset1.y;
            const x2 = bodyPosition.x + dirOffset2.x;
            const y2 = bodyPosition.y + dirOffset2.y;
            const x3 = bodyPosition.x + dirOffset3.x;
            const y3 = bodyPosition.y + dirOffset3.y;

            direction.lineStyle(2, 0x000000, 1);
            direction.fillStyle(0x000000, 1);
            direction.fillTriangle(x1, y1, x2, y2, x3, y3);
            direction.strokeTriangle(x1, y1, x2, y2, x3, y3);
            //direction.setAngle(180);
            this.direction[entity.id] = direction;


            // Alles was man rendert, kann man auch verschieben. Macht es trotzdem
            // vielleicht Sinn eine eigene "DraggableComponent" zu erzeugen und
            // nur anhand dessen ein Objekt draggable zu machen oder nicht?
            image.setInteractive({ draggable: true, useHandCursor: true });
            image.on('drag', (gameObject: unknown, x: number, y: number) => {
                transform.position.set({ x, y })
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
    }
  protected onEntityDestroyed(entity: Entity): void {
    const render = this.renderObjects[entity.id];

    render.destroy();
      delete this.renderObjects[entity.id];
      this.direction[entity.id].clear();
      delete this.direction[entity.id];
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

