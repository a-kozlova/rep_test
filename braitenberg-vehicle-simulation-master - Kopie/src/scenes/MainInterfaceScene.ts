import Phaser from 'phaser';
import ToggleButton from '../gui/ToggleButton';
import Button from '../gui/Button';
import MainScene from './MainScene';

export default class MainInterfaceScene extends Phaser.Scene {
  private buttons: Button[] = [];

  public constructor() {
    super({ key: 'MainInterfaceScene' });
  }

  public create(): void {
    this.scale.on('resize', this.handleResize.bind(this));
    const mainScene = this.scene.get('MainScene') as MainScene;

	// Position der Tasten an Bildschirm anpassen
    const start = new ToggleButton(this, this.game.renderer.width / 2, this.game.renderer.height - 70, 6, 9, () => {
      mainScene.pause(!mainScene.isRunning());
    });

    const newFile = new Button(this, 45 + start.getWidth(), 35, 5, () => {
      MainScene.loadSnapshot();
    }, 'New file');

    const save = new Button(this, 110 + start.getWidth(), 35, 18, () => {
      MainScene.createSnapshot();
    }, 'Save');

    const showEditor = new Button(this, this.cameras.main.displayWidth - 35, 35, 17, () => {
      this.scene.launch('EditorScene');
    }, '');

    const exportButton = new Button(this, 175 + start.getWidth(), 35, 0, () => {
      MainScene.exportJson();
    }, 'Save scene as');

    const importButton = new Button(this, 240 + start.getWidth(), 35, 4, () => {
      MainScene.importJson();
    }, 'Load scene from');

    const zoomIn = new Button(this, 80, this.cameras.main.displayHeight - 60, 12, () => {
          
    }, '');
    const zoomOut = new Button(this, 120, this.cameras.main.displayHeight - 60, 16, () => {

    }, '');

    this.buttons.push(start, newFile, showEditor, save, exportButton, importButton, zoomIn, zoomOut);	
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const showEditor = this.buttons[2];
    showEditor.setPosition(gameSize.width - 35, 35);
  }
}
