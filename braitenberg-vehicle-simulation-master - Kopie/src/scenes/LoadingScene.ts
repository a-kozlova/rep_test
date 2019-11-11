import Phaser from 'phaser';
import Noty from 'noty';

import buttonSpriteSheet from '../../assets/gui_buttons.png';

import vehicle from '../../assets/vehicleV2.png';
import vehicle2a from '../../assets/prefabs/2a.png';
import vehicle2b from '../../assets/prefabs/2b.png';
import vehicle3a from '../../assets/prefabs/3a.png';
import vehicle3b from '../../assets/prefabs/3b.png';
import source from '../../assets/prefabs/source.png';
import blank from '../../assets/prefabs/blank.png';

export default class LoadingScene extends Phaser.Scene {
  public constructor() {
    super({ key: 'LoadingScene' });
  }

  public static userOptions(): object {
    return {
      Vehikel: 'vehicle',
      Quelle: 'prefab-source',
      Blank: 'prefab-blank',
    };
  }

  public preload(): void {
    this.createProgress();
    this.load.image('vehicle', vehicle);

    this.load.image('prefab-2a', vehicle2a);
    this.load.image('prefab-2b', vehicle2b);
    this.load.image('prefab-3a', vehicle3a);
    this.load.image('prefab-3b', vehicle3b);
    this.load.image('prefab-source', source);
    this.load.image('prefab-blank', blank);

    this.load.spritesheet('button', buttonSpriteSheet, { frameWidth: 50, frameHeight: 48 });
  }

  public create(): void {
    LoadingScene.setNotificationsOptions();
    this.scene.start('MainScene');
  }

  private static setNotificationsOptions(): void {
    Noty.overrideDefaults({
      layout: 'topCenter',
      theme: 'relax',
      timeout: 1500,
      progressBar: false,
      animation: {
        open: 'animated fadeInDown faster',
        close: 'animated fadeOut faster',
      },
    });
  }

  private createProgress(): void {
    const progress = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progress.clear();
      progress.fillStyle(0xffffff, 1);
      progress.fillRect(0, 270, 800 * value, 60);
    });

    this.load.on('complete', () => {
      progress.destroy();
    });
  }
}
