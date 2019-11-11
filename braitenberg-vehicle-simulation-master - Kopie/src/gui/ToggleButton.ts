import Button from './Button';

export default class ToggleButton extends Button {
  private pressed: boolean = false;

  private activeIcon: number;

  private deactiveIcon: number;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    deaktivIcon: number,
    activIcon: number,
    klickaction: (btn: Button) => void,
  ) {
    super(scene, x, y, deaktivIcon, klickaction);
    this.activeIcon = activIcon;
    this.deactiveIcon = deaktivIcon;
  }

  protected handleClick(action: (btn: Button) => void): void {
    action(this);
    if (this.pressed === false) {
      this.setFrame(this.activeIcon);
      this.pressed = true;
    } else {
      this.setFrame(this.deactiveIcon);
      this.pressed = false;
    }
  }

  public isPressed(): boolean {
    return this.pressed;
  }
}
