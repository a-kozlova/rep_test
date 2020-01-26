﻿import $ from 'jquery';
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
//console.log(mytestgame);

// Create objects from sidebar menu by drag and drop
$(function() {
  $('.draggable').draggable({
    appendTo: 'body',
    helper: 'clone',
    cursor: 'move',
    cancel: '.no-drag',
  });
  $('#phaser').droppable({
    over: function(ui) {
      $(ui.draggable).show();
    },
    drop: function(event, ui) {
      mytestgame.scene.scenes[1].createObject(event.clientX, event.clientY, ui.draggable.attr('id'));
    },
  });
});

$('.prefab-btn').click(function() {
  mytestgame.scene.scenes[1].createObject(300, 200, $(this).attr('id'));
});

// add remove emission
$('#emis.switch-btn').click(function() {
  $(this).toggleClass('switch-on');
  if ($(this).hasClass('switch-on')) {
    $(this).trigger('on.switch');
    entity.getComponent('Quelle').activateSourceComponent();
  } else {
    $(this).trigger('off.switch');
    entity.getComponent('Quelle').deactivateSourceComponent();
  }
  $('#emRange').attr('placeholder', entity.getComponent('Quelle').range.value);
  $('#emRange').attr('value', entity.getComponent('Quelle').range.value);
  var event = new CustomEvent('componentChanged', { detail: entity });
  document.dispatchEvent(event);
});

$('#closeSettings').click(function(){
	var event = new CustomEvent('closeSettings');
	document.dispatchEvent(event);

})

//Farbe
$('input[name="farbe"]:radio').change(function() {
  entity.components.forEach(component => {
    if (component.name == 'Rendering') {
      component.setColor($("input[name='farbe']:checked").val());
    }
  });
});

//Form
$('input[name="form"]:radio').change(function() {
  entity.components.forEach(component => {
    if (component.name == 'Koerper' || component.name == 'Render') {
      component.setShape($("input[name='form']:checked").val());
    }
  });
});

//SubstanceType
$('input[name="substance"]:radio').change(function() {
  entity.components.forEach(component => {
    if (component.name == 'Quelle') {
      component.setSubstanceType($("input[name='substance']:checked").val());
    }
  });
});

//Emission type
$('input[name="emission"]:radio').change(function() {
  entity.components.forEach(component => {
    if (component.name == 'Quelle') {
      component.setEmissionType($("input[name='emission']:checked").val());
    }
  });

 var event = new CustomEvent('componentChanged', { detail: entity });
  document.dispatchEvent(event);
});

// add remove solid body
$('#solidBody.switch-btn').click(function() {
  $(this).toggleClass('switch-on');
  if ($(this).hasClass('switch-on')) {
    $(this).trigger('on.switch');
    mytestgame.scene.scenes[3].addSolidBody(entity);
  } else {
    $(this).trigger('off.switch');
    mytestgame.scene.scenes[3].deleteSolidBody(entity, entity.getComponent(ComponentType.SOLID_BODY));
  }
});

//static
$('#static.switch-btn').click(function() {
  if (entity.getComponent('Koerper')) {
    $(this).toggleClass('switch-on');
    if ($(this).hasClass('switch-on')) {
      $(this).trigger('on.switch');
      entity.getComponent('Koerper').setStatic(true);
    } else {
      $(this).trigger('off.switch');
      entity.getComponent('Koerper').setStatic(false);
    }
  }
});

// add sensor	!!!!!!!!!!!!!!!!!!!!!! peredelat dlya vsech
document.addEventListener('addSensor', function(event) {
  mytestgame.scene.scenes[3].addSensor(entity, event.detail.position);
});

// add motor
document.addEventListener('addMotor', function() {
  mytestgame.scene.scenes[3].addMotor(entity, event.detail.position);
});

document.addEventListener('deleteSensor', function(event) {
    mytestgame.scene.scenes[3].deleteSensor(entity, event.detail.component);
});

document.addEventListener('deleteMotor', function (event) {
    mytestgame.scene.scenes[3].deleteMotor(entity, event.detail.component);
});



document.addEventListener('delEnt', (event) => {
    //console.log("deleteEntity settscen", event);
    if (confirm("Delete this entity?")) {
        EntityManager.destroyEntity(entity.id);
    }
});

