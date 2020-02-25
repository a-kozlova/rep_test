import Phaser from 'phaser';
import Noty from 'noty';
import Entity from '../Entity';
import { ComponentType } from '../enums';
import SidebarScene from './SidebarScene';
import Attribute from '../components/Attribute';
import EntityManager from '../EntityManager';
import ConnectionComponent from '../components/ConnectionComponent';
import MotorComponent from '../components/MotorComponent';
import SensorComponent from '../components/SensorComponent';
import SolidBodyComponent from '../components/SolidBodyComponent';
import SourceComponent from '../components/SourceComponent';
import ScrollableContainer from '../gui/ScrollableContainer';


import Button from '../gui/Button';
import { getNode, parseDOM } from '../utils/dom';

type DropHandler = (position: { x: number; y: number }) => void;


export default class SettingScene extends SidebarScene {
  public constructor() {
    super('SettingScene');
  }

	
	public onCreate(container: ScrollableContainer, entity: Entity): void {

        const seperator = this.add.dom(0, 0, 'hr').setClassName('sidepar-seperator base-input-container');
        const tabs = this.add.dom(0, 0).createFromHTML(` 
        <div id = "settings"> </div>`);
;
        let createBtn = tabs.getChildByID("drag-source");
        createBtn.addEventListener("dragstart", () => {
            console.log("start");
        });

        let obj = tabs.getChildByID("object-container");
        obj.addEventListener("dragover", (e) => {
            e.preventDefault();
            console.log("over");
        });

        obj.addEventListener("drop", () => {
            console.log("end");
            obj.appendChild(createBtn.cloneNode());
         });		        
        
        const uiElements = entity.getAllComponents().map((component): Phaser.GameObjects.DOMElement[] => {
            const infoTip = component.getInfo()
                ? ` <div class="tooltip-left" data-tooltip="${component.getInfo()}"><i class="fa fa-xs fa-info-circle"></i></div>`
                : '';
            const title = this.add
                .dom(0, 0)
                .createFromHTML(
                    `<h3>${component.name} <div class="component-title-info">[ID: ${component.id}]${infoTip}</div></h3>`,
                )
                .setClassName('component-title');

            let deleteButton;
            if (component.isDeletable()) {
                deleteButton = this.add.dom(100, 30, 'div', '', '✖').setClassName('deleteButton');
                deleteButton.setData('ignoreHeight', true);
                deleteButton.addListener('click');
                deleteButton.on('click', () => {
                    EntityManager.removeComponent(entity.id, component);
                    // alle Componenten der Enitität neu laden
                    container.removeAll(true);
                    container.reset();
                    this.onCreate(container, entity);
                });
            }
            else {
                deleteButton = this.add.dom(0, 0, 'div', '')
            }

            const attributes = Object.keys(component).map(attribute => {
                console.log(attribute);
                if (component[attribute] instanceof Attribute) {
                    return (component[attribute] as Attribute<any, any>).render(this, entity);
                }

                return undefined;
            });

            const attrs = attributes.map((element): Phaser.GameObjects.DOMElement | undefined => {
                if (element) {
                    return element.node;
                }
                return undefined;
            });

            return [title, deleteButton]; 
        });
		     
        this.pack([seperator, tabs]); 
    }


    public addMotor(entity: Entity, position: Vector2D): void {
        EntityManager.addComponent(
            entity.id,
            new MotorComponent({
                position: { x: position.x, y: position.y },
                maxSpeed: 50,
                defaultSpeed: 20,
            }),
        );
        
       var event = new CustomEvent("attributeAdded", { detail: entity });
       document.dispatchEvent(event);
    }

    public addSensor(entity: Entity, position: Vector2D): void {
        EntityManager.addComponent(
            entity.id,
            new SensorComponent({
                position: { x: position.x, y: position.y },
                range: 20,
                angle: 0.3,
            }),
        );

        var event = new CustomEvent("attributeAdded", { detail: entity });
        document.dispatchEvent(event);
    }

    public deleteSensor(entity: Entity, component: SensorComponent): void {
        EntityManager.removeComponent(entity.id, component);

        var event = new CustomEvent("attributeAdded", { detail: entity });
        document.dispatchEvent(event);
    }

    public deleteMotor(entity: Entity, component: MotorComponent): void {
        EntityManager.removeComponent(entity.id, component);

        var event = new CustomEvent("attributeAdded", { detail: entity });
        document.dispatchEvent(event);
    }
   

    public addSolidBody(entity: Entity): void {

        EntityManager.addComponent(entity.id, new SolidBodyComponent({
			size: entity.getComponent('Rendering').size.get(),
			shape: entity.getComponent('Rendering').shape.get(),
		}));
   
        var event = new CustomEvent("attributeAdded", { detail: entity });
        document.dispatchEvent(event);
    }

    public deleteSolidBody(entity: Entity, component: SolidBodyComponent): void {
        EntityManager.removeComponent(entity.id, component);
        var event = new CustomEvent("attributeAdded", { detail: entity });
        document.dispatchEvent(event);
    }

}
