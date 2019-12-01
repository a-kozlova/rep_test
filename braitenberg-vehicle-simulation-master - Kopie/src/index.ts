import $ from "jquery";
import 'jquery-ui-dist/jquery-ui';
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import MainInterfaceScene from './scenes/MainInterfaceScene';
import LoadingScene from './scenes/LoadingScene';
import EntityManager from './EntityManager';
import Entity from './Entity';
import MotorComponent from './components/MotorComponent';
import SourceComponent from './components/SourceComponent';

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

$(function () {
$('.draggable').draggable({
	appendTo: 'body',
	helper: "clone",
	cursor: 'move',
    cancel : '.no-drag'
});
$("#phaser").droppable({
	over: function(ui) {
		$(ui.draggable).show()},
	drop: function (event, ui) {
		mytestgame.scene.scenes[1].createObject(event.clientX, event.clientY, ui.draggable.attr("id"));
    }
});

}); 

$('.prefab-btn').click(function(){
	mytestgame.scene.scenes[1].createObject(300, 200, $(this).attr("id"));
});


//Checkbox Inputs

$('input[name="farbe"]:radio').change(function () {
        alert($("input[name='farbe']:checked").val());
    });
$('input[name="form"]:radio').change(function () {
		entity.components.forEach(component => {
			if (component.name == "Koerper") {
				component.setShape($("input[name='form']:checked").val());          
			}
		});
    });
$('input[name="substance"]:radio').change(function () {
		let hasSourceComponent = false;
		entity.components.forEach(component => {			
			if (component.name == "Quelle") {
				component.setSubstanceType($("input[name='substance']:checked").val());
				hasSourceComponent = true;
			} 			
		});
		if (!hasSourceComponent){
				let source = new SourceComponent({range: 100,});
				entity.addComponent(source);
			}

		console.log(entity);
    });



		



