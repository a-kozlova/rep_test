import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import MainInterfaceScene from './scenes/MainInterfaceScene';
import LoadingScene from './scenes/LoadingScene';
import EntityManager from './EntityManager';
import Entity from './Entity';
import MotorComponent from './components/MotorComponent';

import 'animate.css';
import 'noty/lib/noty.css';
import 'noty/lib/themes/relax.css';
import '../assets/css/picnic.min.css';
import '../assets/css/styling.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#EAEAEA',
  parent: 'phaser',
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
};

// eslint-disable-next-line
//create a variable

var mytestgame = new Phaser.Game(config);

//Have a look at all the members of mytestgame in the console
console.log(mytestgame);

//create the callback function

document.getElementById('testbutton').onclick = function() {
  mytestgame.scene.scenes[1].createBarrier();
};
document.getElementById('blank').onclick = function() {
  mytestgame.scene.scenes[1].createBlank();
};
document.getElementById('source').onclick = function() {
  mytestgame.scene.scenes[1].createSource();
};

document.getElementById('prefab2a').onclick = function() {
  mytestgame.scene.scenes[1].createPrefab2a();
};
document.getElementById('prefab2b').onclick = function() {
  mytestgame.scene.scenes[1].createPrefab2b();
};
document.getElementById('prefab3a').onclick = function() {
  mytestgame.scene.scenes[1].createPrefab3a();
};
document.getElementById('prefab3b').onclick = function() {
  mytestgame.scene.scenes[1].createPrefab3b();
};
document.getElementById('prefab3b').onclick = function() {
  mytestgame.scene.scenes[1].createPrefab3b();
};



document.getElementById('motorCanvas').onchange = function () {
    console.log("motor change");
};  


$('#addMotor').draggable({
    start: function () {
        console.log("start");
    },
    drag: function () {
        console.log("drag");
    },
    stop: function () {
        console.log("stop");
    }
});

