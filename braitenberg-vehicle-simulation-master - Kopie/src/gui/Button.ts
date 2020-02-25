import Phaser from 'phaser';

export default class Button extends Phaser.GameObjects.Sprite {
  public constructor(scene: Phaser.Scene, x: number, y: number, icon: number,  action: (btn: Button) => void, name: string) {
    super(scene, x, y, 'button', icon);
    scene.add.existing(this);
	this.setInteractive({
      useHandCursor: true,
    });

	// Zeigt die Erlaeuterung zu einer Taste an
	var txt = scene.add.text(x-15, y+30, name, { fontFamily: 'Arial', fontSize: 18, color: '#000000' }); 
	txt.visible = false;

    this.on('pointerover', () => {
      this.setTint(0xfafafa);
	  txt.setVisible(true);
    });

    this.on('pointerout', () => {
      this.setTint(0xffffff);
	  txt.setVisible(false);
    });

    this.on('pointerdown', () => {
      this.handleClick(action);
    });
  }

  protected handleClick(action: (btn: Button) => void): void {
    action(this);
  }

  public getWidth(): number {
    return this.width;
  }
}
