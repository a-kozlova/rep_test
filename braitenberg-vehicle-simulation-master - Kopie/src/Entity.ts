import Noty from 'noty';

import { ComponentType } from './enums';
import Component from './components/Component';

export default class Entity {
  public id: number;

  private components: Component[] = [];

  /**
   * Hier wird einmal gespeichert, wie viele ENtitäten es in der Welt gibt.
   * Das wird dazu benutzt, um Entitäten stets eie eindeutige ID geben zu
   * können.
   */
  public static numOfEntities = 0;

  /**
   * Erzeugt eine neue Entität.
   * Dies ist möglich, da manchmal nötig, nach Möglichkeit sollten jedoch die
   * entsprechenden Funktionen aus der Klasse `EntityManager` benutzt werden.
   */
  public constructor() {
    this.id = Entity.numOfEntities;
    Entity.numOfEntities += 1;
  }

  /**
   * Fügt eine neue Komponente zur Entität hinzu, falls die maximal erlaubte
   * Anzahl des Typs noch nicht überschritten wurde.
   *
   * @param component
   *
   * @returns Liefert die ID der Komponente zurück. Wurde die Komponente nicht
   *          hinzugefügt, dann wird `-1` zurückgegeben.
   */
  public addComponent(component: Component): number {
    const currentAmount = this.getMultipleComponents(component.name).length;

    // Komponenten können angeben, wie viele davon zu einer Entität hinzugefügt werden dürfen.
    if (currentAmount >= component.getMaxAmount()) {
      new Noty({
        text: `Die Entität besitzt bereits die maximale Anzahl an Komponenten des Typs ${component.name}`,
      }).show();
      return -1;
    }

    this.components.push(component);
    return component.id;
  }

  // entfernt die übergebene Komponente falls vorhanden
  // gibt entfernte Komponentezurück
  public removeComponent(component: Component): Component | undefined {
    const index = this.components.indexOf(component);
    if (index >= 0) {
      return this.components.splice(index, 1)[0];
    }

    return undefined;
  }

  // gibt die erste Komponentemit dem Übergebenen Component Typ zurück
  public getComponent<T extends Component>(name: ComponentType): T | undefined {
    return this.components.find(c => c.name === name) as T;
  }

  // gibt alle Komponente mit dem übergebenen Component Type zurück
  public getMultipleComponents(name: ComponentType): Component[] {
    return this.components.filter(c => c.name === name);
  }

  //
  public hasComponents(...components: ComponentType[]): boolean {
    const available = this.components.map(c => c.name);
    return components.every(name => available.includes(name));
  }

  // gibt alle Komponente der Entität zurück
  public getAllComponents(): Component[] {
    return this.components;
  }

  // Serialisierungsfunktion für die Umwandlung in JSON
  public serialize(): SerializedEntity {
    return {
      id: this.id,
      components: this.components.map(component => component.serialize()),
    };
  }
}
