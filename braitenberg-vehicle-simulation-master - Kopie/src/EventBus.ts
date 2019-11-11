import { EventType } from './enums';

interface EventHandlerDictionary {
  [index: string]: EventHandler[];
}

/**
 *
 */
class EventBus {
  private handlers: EventHandlerDictionary = {};

  /**
   * Erzeugt eine neue Nachricht des Typs `event` auf dem Bus.
   *
   * @param event
   * @param payload
   */
  public publish(event: EventType, payload: EventMessage): void {
    if (!this.handlers[event]) return;

    this.handlers[event].forEach(handler => {
      // Hier beschwert sich Typescript aus irgendeinem Grund, dass `payload` den eizelnen
      // Typen nicht zugewiesen werden kann, aber `EventMessage` ist eine Union aus all
      // den Typen. Funktions-technisch gibt es aber keine Probleme damit.
      handler(payload);
    });
  }

  /**
   * Horcht auf ein bestimmtes Event `event` und registiert dafür einen Handler.
   *
   * @param event
   * @param handler
   */
  public subscribe(event: EventType, handler: EventHandler): void {
    // Es kann sein, dass `handler` der allererste Handler des Typs ist, dann
    // muss auch ein neues Array erzeugt werden, um Fehler vorzubeugen.
    if (!this.handlers[event]) this.handlers[event] = [];

    this.handlers[event].push(handler);
  }
}

// Wir exportieren hier einmal eine Instanz der Klasse, das entspricht in JS
// einem Singleton-Pattern, so dass wir von überall auf den selben Bus zu-
// greifen können.
export default new EventBus();
