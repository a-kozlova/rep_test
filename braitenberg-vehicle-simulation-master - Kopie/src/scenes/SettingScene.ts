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
