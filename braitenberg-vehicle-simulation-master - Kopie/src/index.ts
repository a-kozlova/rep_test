import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import MainInterfaceScene from './scenes/MainInterfaceScene';
import LoadingScene from './scenes/LoadingScene';

import 'animate.css';
import 'noty/lib/noty.css';
import 'noty/lib/themes/relax.css';
import '../assets/css/picnic.min.css';
import '../assets/css/styling.css';



const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#EAEAEA',
  parent: 'body',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  dom: {
    createContainer: true,
  },
  input: {
    windowEvents: false,
  },
  scene: [LoadingScene, MainScene, MainInterfaceScene],
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
    },
  },
  // add tabs
  /*plugins: { 
    scene: [{ 
       key:  'rexUI', 
       plugin:  UIPlugin, 
       mapping:  'rexUI'
    }, 
        // ...
    ]
  },*/
};

// eslint-disable-next-line
new Phaser.Game(config);
