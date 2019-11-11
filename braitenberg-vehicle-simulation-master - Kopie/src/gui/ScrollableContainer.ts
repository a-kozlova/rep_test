import Phaser from 'phaser';

export default class ScrollableContainer extends Phaser.GameObjects.Container {
  private scrollOffset: number = 0;

  private scrollbar: Phaser.GameObjects.Rectangle;

  private visibleWidth: number;

  private visibleHeight: number;

  private scrollHandler: (event: WheelEvent) => void;

  public constructor(scene: Phaser.Scene, visibleWidth: number, visibleHeight: number) {
    super(scene);

    this.visibleWidth = visibleWidth;
    this.visibleHeight = visibleHeight;

    this.scrollbar = scene.add.rectangle(0, 0, 10, 10, 0xd8d8d8);
    this.scrollbar.setInteractive({ draggable: true });
    this.scrollbar.setOrigin(1, 0);
    this.scrollbar.on('drag', (gameObject: unknown, x: number, y: number) => {
      const delta = y - this.scrollbar.y;
      this.scroll(delta);
    });
    this.scrollbar.setDepth(999);

    scene.add.existing(this);
    scene.children.bringToTop(this);
    scene.children.bringToTop(this.scrollbar);

    let ticking = false;
    let delta = 0;
    this.scrollHandler = e => {
      // Die delta Werte sind leider krass unterschiedlich für verschiedene Browser, so liefert
      // Chrome z.b. immer Werte 100 / -100, Firefox hingegen immer 3 / -3.
      delta += e.deltaY === 100 || e.deltaY === -100 ? Math.sign(e.deltaY) * 3 : e.deltaY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (this.getBounds().contains(e.x, e.y)) {
            this.scroll(delta * 20);
            delta = 0;
          }
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('wheel', this.scrollHandler);
  }

  public scroll(delta: number): void {
    if (this.height <= this.visibleHeight) return;

    let d = delta;

    if (this.scrollOffset + d < 0) {
      d = -this.scrollOffset;
    } else if (this.scrollOffset + this.scrollbar.height + d > this.visibleHeight) {
      d = this.visibleHeight - this.scrollOffset - this.scrollbar.height;
    }

    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + d, 0, this.visibleHeight);

    this.scrollbar.setPosition(
      this.scrollbar.x,
      Phaser.Math.Clamp(this.scrollbar.y + d, 0, this.visibleHeight - this.scrollbar.height),
    );

    const newY = this.y - (d / (this.visibleHeight - this.scrollbar.height)) * (this.height - this.visibleHeight);
    super.setPosition(this.x, newY);
  }

  public setHeight(height: number): void {
    this.height = height;

    if (height > this.visibleHeight) {
      const barHeight = (this.visibleHeight / height) * this.visibleHeight;
      this.scrollbar.input.hitArea.setSize(this.scrollbar.width, barHeight);
      this.scrollbar.height = barHeight;
      this.scrollbar.setVisible(true);
    } else {
      this.scrollbar.setVisible(false);
    }
  }

  public reset(): void {
    this.height = 0;
    this.scrollbar.input.hitArea.setSize(this.scrollbar.width, 1);
    this.scrollbar.height = 1;
    this.scrollbar.setVisible(false);
    this.scrollOffset = 0;
    this.setPosition(this.x, 0);
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.visibleWidth, this.height);
  }

  public setPosition(x: number, y: number): this {
    const oldY = this.y;
    super.setPosition(x, y);
    if (this.scrollbar) {
      this.scrollbar.setPosition(this.x + this.visibleWidth, this.scrollbar.y + y - oldY);
    }

    return this;
  }

  protected preDestroy(): void {
    window.removeEventListener('wheel', this.scrollHandler);
    super.preDestroy();
    this.scrollbar.destroy();
  }
}
