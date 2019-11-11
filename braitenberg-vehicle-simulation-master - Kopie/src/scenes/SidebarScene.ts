import Phaser from 'phaser';
import Button from '../gui/Button';
import ScrollableContainer from '../gui/ScrollableContainer';
import EventBus from '../EventBus';
import { EventType } from '../enums';

export default abstract class SidebarScene extends Phaser.Scene {
  protected container: ScrollableContainer | null = null;

  protected background: Phaser.GameObjects.Rectangle | null = null;

  protected closeButton: Button | null = null;

  protected key: string;

  private handler: (gameSize: Phaser.Structs.Size) => void;

  public constructor(key: string) {
    super({ key });
    this.key = key;
    this.handler = this.handleResize.bind(this);
  }

  public static getWidth(): number {
    return 256;
  }

  protected abstract onCreate(container: Phaser.GameObjects.Container, ...args: any): void;

  public create(...args: unknown[]): void {
    this.scale.on('resize', this.handler);

    this.background = this.add.rectangle(0, 0, SidebarScene.getWidth(), this.cameras.main.displayHeight, 0xf8f8f8);
    this.background.setOrigin(0);
    this.background.setPosition(this.cameras.main.displayWidth, 0);
    this.background.setDepth(0);

    const container = new ScrollableContainer(this, SidebarScene.getWidth(), this.cameras.main.displayHeight);
    container.setPosition(this.cameras.main.displayWidth, 0);
    this.container = container;
    this.container.setDepth(1);

    this.closeButton = new Button(this, this.cameras.main.displayWidth - 35, 35, 19, () => {
      this.tweens.add({
        targets: [this.container, this.background],
        x: `+=${SidebarScene.getWidth()}`,
        y: 0,
        duration: 100,
        ease: 'Expo.easeInOut',
        onComplete: () => this.close(),
      });
    }, 'Close');

    this.onCreate(container, ...args);

    this.tweens.add({
      targets: [this.container, this.background, this.closeButton],
      x: `-=${SidebarScene.getWidth()}`,
      duration: 200,
      ease: 'Expo.easeInOut',
      onComplete: () => {
        // Hier muss die Position noch mal gesetzt werden, damit die Scrollbar auch auftaucht.
        container.setPosition(container.x, container.y);
      },
    });
  }

  protected close(): void {
    EventBus.publish(EventType.SIDEBAR_CLOSED, null);
    this.scale.off('resize', this.handler);
    this.scene.stop(this.key);
  }

  protected pack(
    objects: (
      | Phaser.GameObjects.Image
      | Phaser.GameObjects.Sprite
      | Phaser.GameObjects.DOMElement
      | Phaser.GameObjects.Text
      | undefined)[],
    usePadding: boolean = true,
  ): void {
      console.log(this.container);
    if (this.container) {
      const padding = usePadding ? 15 : 0;
      let lastAddedHeight = 0;
      for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];

        if (object) {
          const objectHeight = object.height;
          object.setPosition(SidebarScene.getWidth() / 2, this.container.height + objectHeight / 2 + padding);

          this.container.add(object);
          if (object.getData('ignoreHeight')) {
            object.setPosition(
              SidebarScene.getWidth() / 2,

              this.container.height - lastAddedHeight / 2,
            );
          } else {
            this.container.setHeight(this.container.height + objectHeight + padding);
            lastAddedHeight = objectHeight;
          }
        }
      }
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    if (this.container) {
      this.container.setPosition(gameSize.width - SidebarScene.getWidth(), this.container.y);
    }
    if (this.closeButton) {
      this.closeButton.setPosition(gameSize.width - SidebarScene.getWidth() - 35, 35);
    }
    if (this.background) {
      this.background.setPosition(gameSize.width - SidebarScene.getWidth(), 0);
      this.background.setSize(SidebarScene.getWidth(), gameSize.height);
    }
  }

	// for settings
	public getX(): number {
		return this.game.renderer.width - SidebarScene.getWidth() + 60;
	}
	
}
