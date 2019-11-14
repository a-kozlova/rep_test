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

//for tabs
import UIPlugin from '../../templates/ui-plugin.js';
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
        <div id = "settings">
             <div class="nav nav-tabs nav-fil" id="myTabs" role="tablist">
                <a class="nav-item nav-link active col-4" data-toggle="tab" href="#motor" role="tab" aria-controls="nav-home" aria-selected="true">Motor</a>
                <a class="nav-item nav-link col-4" data-toggle="tab" href="#sensor" role="tab" aria-controls="nav-home" aria-selected="false">Sensor</a>
                <a class="nav-item nav-link col-4" data-toggle="tab" href="#body" role="tab" aria-controls="nav-home" aria-selected="false">Body</a>
                <a class="nav-item nav-link col-6" data-toggle="tab" href="#emission" role="tab" aria-controls="nav-home" aria-selected="false">Emission</a>
                <a class="nav-item nav-link col-6" data-toggle="tab" href="#connection" role="tab" aria-controls="nav-home" aria-selected="false">Connection</a>
             </div>

             <div class="tab-content" id="nav-tabContent">
                  <div role="tabpanel" class="tab-pane active" id="motor">                   
                        <h4>Position</h4>
                            <div id="drag-drop-basic">
                                <div id="object-container" data-role="drag-drop-container" class = "col-8"></div>
                                <div id="add-remove-container" data-role="drag-drop-container" class = "col-4">
                                    <button id="drag-source" draggable="true">+</button>
                                </div>
                            </div>
                       <h4>Current Speed</h4>
                       <h4>Reichweite</h4>
                       <h4>Winkel</h4>
                  </div>

              <div role="tabpanel" class="tab-pane fade" id="sensor">Sensor</div>
                       <h4>Position</h4>
                       <h4>Min Speed</h4>
                       <h4>Max Speed</h4>
              <div role="tabpanel" class="tab-pane fade" id="emission">
                  <h4>Type</h4>
                  <div class="custom-control">
                      <input type="radio" id="barrier" name="emission" class="custom-control-input" checked>
                      <label class="custom-control-label" for="barrier">Barrier</label>
                  </div>
                  <div class="custom-control">
                      <input type="radio" id="sour" name="emission" class="custom-control-input">
                      <label class="custom-control-label" for="sour">Source</label>
                  </div>
              </div>

              <div role="tabpanel" class="tab-pane fade" id="body">
                    <h4>Form</h4>
                    <div class="custom-control">
                      <input type="radio" id="rectangle" name="form" class="custom-control-input" checked>
                      <label class="custom-control-label" for="rectangle">Rectangle</label>
                    </div>
                    <div class="custom-control">
                      <input type="radio" id="circle" name="form" class="custom-control-input">
                      <label class="custom-control-label" for="circle">Circle</label>
                    </div>

                    <h4>Breite</h4>
                    <h4>Höhe</h4>
                    <h4>Farbe</h4>
                    <div class="custom-control custom-radio">
                      <input type="radio" id="grey" name="farbe" class="custom-control-input" checked>
                      <label class="custom-control-label" for="grey">Grey</label>
                    </div>
                    <div class="custom-control custom-radio">
                      <input type="radio" id="red" name="farbe" class="custom-control-input">
                      <label class="custom-control-label" for="red">Red</label>
                    </div>
                    <div class="custom-control custom-radio">
                      <input type="radio" id="green" name="farbe" class="custom-control-input">
                      <label class="custom-control-label" for="green">Green</label>
                    </div>
                    <div class="custom-control custom-radio">
                      <input type="radio" id="blue" name="farbe" class="custom-control-input">
                      <label class="custom-control-label" for="blue">Blue</label>
                    </div>
              </div>
              <div role="tabpanel" class="tab-pane fade" id="connection">Connection</div>
            </div>
        </div>`);
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

    

}
