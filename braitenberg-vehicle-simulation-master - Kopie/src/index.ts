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
import SolidBodyComponent from './components/SolidBodyComponent';
import { ComponentType } from './enums';

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

$("#deleteEmission").on('click', function(){
	console.log('delete emission');
});

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
		if (!entity.hasComponents(ComponentType.SOURCE)){
			let source = new SourceComponent({range: 100,});				
			entity.addComponent(source);
		} 
		
		entity.components.forEach(component => {			
			if (component.name == "Quelle") {
				component.setSubstanceType($("input[name='substance']:checked").val());
			} 			
		});				
		
		console.log(entity);
    });


//Fester Körper !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NE PO KLIKU!!!!
$('#solidBody').click(function () {
    console.log("sb tut");
	if (entity.hasComponents(ComponentType.SOLID_BODY)){
		$('.switch-btn').addClass('switch-on');
	}
});

$('.switch-btn').click(function(){
	$(this).toggleClass('switch-on');
    if ($(this).hasClass('switch-on')) {
        $(this).trigger('on.switch');
        console.log("включили");
        if (!entity.hasComponents(ComponentType.SOLID_BODY)){
			entity.addComponent(
				new SolidBodyComponent({
				  size: { width: 100, height: 150 },
				}),
			);
			console.log(entity);
		} 
    } else {
        $(this).trigger('off.switch');
        console.log("выключили");
		if (entity.hasComponents(ComponentType.SOLID_BODY)){
			entity.removeComponent(entity.getComponent(ComponentType.SOLID_BODY));
		} 
		
			console.log(entity);
    }
});



// add sensor	!!!!!!!!!!!!!!!!!!!!!! peredelat dlya vsech
$(function () {
    $('#addSensor').draggable({
        appendTo: '#addDeleteSensor',
        helper: "clone",
        cursor: 'move',
    });
    $("#sensorContainer").droppable({
        over: function (ui) {
            $(ui.draggable).show()
        },
        drop: function (event, ui) {
            console.log(event);
            mytestgame.scene.scenes[3].addSensor(entity);
        }
    });

});

// add motor	
$(function () {
    $('#addMotor').draggable({
        appendTo: '#addDeleteMotor',
        helper: "clone",
        cursor: 'move',
    });
    $("#motorContainer").droppable({
        over: function (ui) {
            $(ui.draggable).show()
        },
        drop: function (event, ui) {
            mytestgame.scene.scenes[3].addMotor(entity);
        }
    });

});

document.addEventListener("delete", function (event) {
    mytestgame.scene.scenes[3].deleteSensor(entity.id, event.detail);
    console.log("delete sensor", event.detail);
    //document.removeEventListener("delete", );
});


