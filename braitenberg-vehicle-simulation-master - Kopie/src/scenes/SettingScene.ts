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

  /*private createComponentSelect(entity: Entity): Phaser.GameObjects.DOMElement[] {
    const row = this.add.dom(0, 0).createFromHTML(`<div class="base-input-container">
      <select style="width: 85%" name="components">
      <option value="${ComponentType.MOTOR}">Motor</option>
      <option value="${ComponentType.SENSOR}">Sensor</option>
      <option value="${ComponentType.SOURCE}">Quelle</option>
      <option value="${ComponentType.SOLID_BODY}">Fester Körper</option>
      <option value="${ComponentType.CONNECTION}">Verbindungsnetzwerk</option>
      </select>
    </div>`);

    const select = row.getChildByName('components');

    const el = this.add
      .dom(0, 0)
      .createFromHTML('<i class="fa fa-plus"></i>')
      .setClassName('deleteButton');

    el.setData('ignoreHeight', true);
    el.addListener('click');
    el.on('click', () => {
      const name = (select as HTMLSelectElement).value;
      let added;

      switch (name) {
        case ComponentType.MOTOR:
          added = EntityManager.addComponent(
            entity.id,
            new MotorComponent({
              position: { x: 0, y: 0 },
              maxSpeed: 50,
              defaultSpeed: 5,
            }),
          );
          break;
        case ComponentType.SENSOR:
          added = EntityManager.addComponent(
            entity.id,
            new SensorComponent({
              position: { x: 0, y: 0 },
              range: 20,
              angle: 0.3,
            }),
          );
          break;
        case ComponentType.SOURCE:
          added = EntityManager.addComponent(
            entity.id,
            new SourceComponent({
              range: 100,
            }),
          );
          break;
        case ComponentType.SOLID_BODY:
          added = EntityManager.addComponent(entity.id, new SolidBodyComponent({}));
          break;
        case ComponentType.CONNECTION:
          {
            const inputs = entity.getMultipleComponents(ComponentType.SENSOR).map(com => com.id);
            const outputs = entity.getMultipleComponents(ComponentType.MOTOR).map(com => com.id);
            added = EntityManager.addComponent(
              entity.id,
              new ConnectionComponent({
                inputIds: inputs,
                outputIds: outputs,
              }),
            );
          }
          break;
        default:
      }

      if (added === undefined) {
        return;
      }

      new Noty({ text: `Komponente ${name} hinzugefügt.` }).show();

      // alle Componenten der Enittät neu laden
      this.container!.removeAll(true);
      this.container!.height = 0;
      this.onCreate(this.container!, entity);
    });

    return [row, el];
  }
  */
 
	
	public onCreate(container: ScrollableContainer, entity: Entity): void {

        const seperator = this.add.dom(0, 0, 'hr').setClassName('sidepar-seperator base-input-container');


        const tabs = this.add.dom(0, 0).createFromHTML(` 
        <div id = "settings"> </div>`);
;

        console.log("tabs", tabs);


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


            console.log(component.name, attributes);

            const attrs = attributes.map((element): Phaser.GameObjects.DOMElement | undefined => {
                if (element) {
                    return element.node;
                }
                return undefined;
            });


            return [title, deleteButton /*, ...attributes , ...attrs*/]; 
        });

       
        
        // fuer jedes elt Node-array html-Inhalt nach tab-Inhalt kontrollieren und an tabs anhängen
        // prm: überschneidet sich, fall mehrere Nodes
       /* uiElements.flat(2).map((element): Element => {
            return element.node;
        }).forEach(element => {
            if (element != undefined) {
                let temp = element.outerHTML;
                if (temp.includes("Motor") || temp.includes("deleteButton")) {
                    tabs.getChildByID('motor').append(element);
                } else if (temp.includes("Sensor") || temp.includes("deleteButton")) {
                    tabs.getChildByID('sensor').append(element);
                } else if (temp.includes("Körper") || temp.includes("deleteButton")) {
                    tabs.getChildByID('body').append(element);
                } else if (temp.includes("Rendering") || temp.includes("Transform") || temp.includes("deleteButton")) {
                    tabs.getChildByID('source').append(element);
                } else if (temp.includes("Verbindung") || temp.includes("deleteButton")) {
                    tabs.getChildByID('connection').append(element);
                }
            }
        });*/



        this.pack([seperator, tabs]); 
    }


    public addMotor(entity: Entity): void {
        EntityManager.addComponent(
            entity.id,
            new MotorComponent({
                position: { x: 0, y: 0 },
                maxSpeed: 50,
                defaultSpeed: 5,
            }),
        );
        
       var event = new CustomEvent("attributeAdded", { detail: entity });
       document.dispatchEvent(event);
      

    }

    public updateComponent(entity: Entity): void {
        if (entity) {
            console.log(entity);
        }
       
    }

}
