
var entity = null;
//var color = ["#00ffff", "#00ff00", "#ff00ff", "#cecece", "#cece00", "#ce00ce", "#00cece", "#c00ece", "#cec00e", "#0000ce"];
let motorComponents = [];
let sensorComponents = [];
let size = { "width": 200, "height": 250 };
let rangeFA = 0;
let angleFA = 0;
let reactionFA = "Hindernis";
let defaultSpeedFA = 0;
let maxSpeedFA = 20;

document.addEventListener("entitySelected", openSettings);
document.addEventListener("attributeAdded", openSettings);

document.addEventListener("componentChanged", openSettings);
document.addEventListener("closeSettings", closeSettings);


$(document).on('entity:delete', function (event, options) {
    let ev = new CustomEvent('delEnt', { detail: options });
    console.log("html delte entiti", options);
    document.dispatchEvent(ev);
});


 $('#deleteEntity').on('click', () => {
        $(document).trigger('entity:delete', [entity]);
 });

function resetSettings() {           

//$('.switch-btn').removeClass('switch-on');

$('input:radio').prop('checked', false);

}

function openSettings(event) {
    closeNav();
    resetSettings();
    //closeSettings();
    document.getElementById("myEntitySettings").style.width = "256px";
    document.getElementById("createEntityMenu").style.marginRight = "306px";

    entity = event.detail;                  // die aufgerufene Entität
    console.log("opensettings", entity);

   

    motorComponents = entity.components.filter(component => component.name == "Motor");
    sensorComponents = entity.components.filter(component => component.name == "Sensor");
    var renderComponents = entity.components.filter(component => component.name == "Rendering");
    var solidBodyComponents = entity.components.filter(component => component.name == "Koerper");
    var sourceComponents = entity.components.filter(component => component.name == "Quelle");
    var transformableComponents = entity.components.filter(component => component.name == "Transform");
    var connectionComponents = entity.components.filter(component => component.name == "Verbindung");
   

    size = { "width": 100, "height": 150 };
    //var shape = "circle";
    if (solidBodyComponents[0]) {
        size = solidBodyComponents[0].size.value;
        console.log("size db izmenen", size);
    }


    drawSliders(motorComponents);


    sensorSettings(sensorComponents);
    bodySettings(solidBodyComponents, renderComponents);
    emissionSettings(sourceComponents);
    paintMotorCanvas();
    paintSensorCanvas();
}

function emissionSettings(sourceComponents) {
    $('#emRange').remove();
    $('#emissionRange').after('<input id = "emRange" class="col-4" style = "height: 25px;">');

	$('#emRange').attr('value', sourceComponents[0].range.value);
    if (sourceComponents[0].isActive){
        $('#emis.switch-btn').addClass("switch-on");

        $("#barrier").prop('disabled', false);
        $("#sour").prop('disabled', false);
        $("#gaus").prop('disabled', false);
        $("#flat").prop('disabled', false);
        if(sourceComponents[0].substance.value ==="Licht") {
            $("#sour").prop('checked', true);
            $("#barrier").prop('checked', false);
        }
        if(sourceComponents[0].substance.value ==="Hindernis") {
            $("#sour").prop('checked', false);
            $("#barrier").prop('checked', true);
        }

        if(sourceComponents[0].emissionType.value ==="GAUSSIAN") {
            $("#gaus").prop('checked', true);
            $("#flat").prop('checked', false);
            $('#emRange').prop('disabled', false);
            $('#emRange').removeClass('disabled');
            $('#range-label').removeClass('disabled');
            $('#emRange').on('input', function () {
                sourceComponents[0].setRange($(this).val());
            });
        }

        if(sourceComponents[0].emissionType.value ==="FLAT") {
            $("#gaus").prop('checked', false);
            $("#flat").prop('checked', true);
            $('#emRange').prop('disabled', true);
            $('#emRange').addClass('disabled');
            $('#range-label').addClass('disabled');
        }
    } else {
        $('#emis.switch-btn').removeClass("switch-on");

        $("#emRange").prop('disabled', true);
        $('#emRange').addClass('disabled');
        $('#range-label').addClass('disabled');

        $("#barrier").prop('checked', false);
        $("#sour").prop('checked', false);
        $("#gaus").prop('checked', false);
        $("#flat").prop('checked', false);

        $("#barrier").prop('disabled', true);
        $("#sour").prop('disabled', true);
        $("#gaus").prop('disabled', true);
        $("#flat").prop('disabled', true);
    }

}
   

function bodySettings(components, renderComponents) {

    // Zuerst alle input-Kindknoten löschen, 
    // damit keine Abhaengigkeiten zwischen Komponenten der verschiedenen Entitäten entstehen
    $('#bodySize').children("input").each((idx, child) => {
        child.remove();
    });
  
    // input erneut erzeugen
    $('#bodyWidth').after('<input id="width" class="col-3">');
    $('#bodyHeight').after('<input id="height" class="col-3">');


        // die aktuelle Breite, Hoehe und Form der Entität anzeigen
        if (renderComponents[0].shape.value === "Rechteck") {
              $("#height").prop('disabled', false);
		      $("#height").removeClass('disabled');
              $("#rectangle").prop('checked', true);
              $("#circle").prop('checked', false);
        } else if (renderComponents[0].shape.value === "Kreis") {
              console.log("dhape kreis");
              $("#circle").prop('checked', true);
              $("#rectangle").prop('checked', false);
              $("#height").prop('disabled', true);
		      $("#height").addClass('disabled');
        }

        $("#width").val(renderComponents[0].size.value.width);
        $("#height").val(renderComponents[0].size.value.height);

        $("#width").change(function () {
            let newValue = $("#width").val(); // get the current value of the input field.

            if (renderComponents[0].shape.get() === 'Kreis') {
                let newWidth = parseInt(newValue)
                if (components.length) {
                    components[0].setSize({ width: newWidth, height: newWidth });
                }
                renderComponents[0].setSize({ width: newWidth, height: newWidth });
                $("#height").val(newWidth);
            } else {
                if (components.length) {
                    components[0].setSize({ width: parseInt(newValue), height: renderComponents[0].size.value.height });
                }
                renderComponents[0].setSize({ width: parseInt(newValue), height: renderComponents[0].size.value.height });  
            }                       

            size.width = parseInt(newValue);
            paintMotorCanvas();
            paintSensorCanvas();
        });

        $("#height").change(function () {
            let newValue = $("#height").val(); // get the current value of the input field.
            if (components.length) {
                components[0].setSize({ width: renderComponents[0].size.value.width, height: parseInt(newValue) });
            }
            components[0].setSize({ width: renderComponents[0].size.value.width, height: parseInt(newValue) });
            renderComponents[0].setSize({ width: renderComponents[0].size.value.width, height: parseInt(newValue) }); 
            size.height = parseInt(newValue);
            paintMotorCanvas();
            paintSensorCanvas();
        }); 

// wenn SolidBodyComponent vorhanden, den Button auf ON setzten
    if (components.length) {
        $("#static").prop('disabled', false); 
        $('#solidBody.switch-btn').addClass("switch-on");

        if (components[0].isStatic.get()){
            $('#static.switch-btn').addClass("switch-on");
        } else {
            $('#static.switch-btn').removeClass("switch-on");
        }

    } else {
        $('#solidBody.switch-btn').removeClass("switch-on");            
        $('#static.switch-btn').removeClass("switch-on");

       return
    }

    switch (renderComponents[0].asset.value) {
        case 13421772: 
            $("#grey").prop('checked', true);
            break;
    
        case 13713746: 
            $("#red").prop('checked', true);
            console.log('red');
            break;
    
        case 5744185: 
            $("#green").prop('checked', true);
            break;
    
        case 1791363: 
            $("#blue").prop('checked', true);
            break;
    }

}

function sensorSettings(components) {

    // wenn inputs bereits vorhanden sind, entfernen (sonst werden sie bei jedem ENTITY_SELECTED angehängt)
    if ($('#sensorRow  > form').children().length) {
        $('#sensorRow > form').children().each((idx, child) => {
            child.remove('input');
        });    
    }
    if ($('#sensorRowForAll  > form').children().length) {
        $('#sensorRowForAll > form').children().each((idx, child) => {
            child.remove('input');
        });
    }

    // falls Entity keine Sensoren hat
    if (!components.length) {
        return
    }

    components.forEach((component, index) => {
        $("#sensorRange").append(
            '<input id = "range' + component.id + '" style = "background: ' + color[index] +
            '; margin-bottom:10px" placeholder = "' + component.range.value + '">');
        $("#sensorAngle").append(
            '<input id = "angle' + component.id + '" style = "background: ' + color[index] +
            '; margin-bottom:10px" placeholder = "' + component.angle.value + '">');
        $("#sensorReaction").append(
            '<div class="switch-btn switch-reaction" id = "react' + component.id + '" style = "background: ' + color[index] +
            '; margin-bottom:10px">');

        switch (component.reactsTo.get()) {
            case 'Licht': {
                $('#react' + component.id).addClass('switch-on');
                break;
            }
            case 'Hindernis': {
                $('#react' + component.id).removeClass('switch-on');
                break;
            }
        }

            //switch reaction
        $('#react' + component.id).click(function() {
            $(this).toggleClass('switch-on');
            if ($(this).hasClass('switch-on')) {
                  $(this).trigger('on.switch');
                  component.setReaction('source');
            } else {
                  $(this).trigger('off.switch');
                  component.setReaction('barrier');
            }

        });
        
            
        $('#range' + component.id).on('input', function (event) {
            let newValue = $(this).val(); // get the current value of the input field.
            component.setRange(newValue);
            event.preventDefault();
        });

        $('#angle' + component.id).on('input', function () {
            let newValue = $(this).val(); // get the current value of the input field.
            component.setAngle(newValue);
        });  
    });

//For all

    $("#sensorRangeFA").append(
        '<input id = "rangeFA" style = "background: white"; margin-bottom:10px" placeholder = "' + rangeFA + '">');
    $("#sensorAngleFA").append(
        '<input id = "angleFA" style = "background:  white"; margin-bottom:10px" placeholder = "' + angleFA + '">');
    $("#sensorReactionFA").append(
            '<div class="switch-btn switch-reaction" id = "reactFA" style = "margin-bottom:10px">');
    switch (reactionFA) {
            case 'Licht': {
                $('#reactFA').addClass('switch-on');
                break;
            }
            case 'Hindernis': {
                $('#reactFA').removeClass('switch-on');
                break;
            }
        }
    
    $('#rangeFA').on('input', function () {
        let newValue = $(this).val(); // get the current value of the input field.
        //console.log(newValue);
        rangeFA = newValue;
        components.forEach((component, index) => {
            component.setRange(newValue);       
        });        
    });

    $('#angleFA').on('input', function () {
        let newValue = $(this).val(); // get the current value of the input field.
        angleFA = newValue;
        components.forEach((component, index) => {
            component.setAngle(newValue);
        });
    });

        $('#reactFA').click(function() {
            $(this).toggleClass('switch-on');
            if ($(this).hasClass('switch-on')) {
                  $(this).trigger('on.switch');                  
                  components.forEach((component, index) => {
                      component.setReaction('source');
                  });
                  reactionFA = "Licht";
            } else {
                  $(this).trigger('off.switch');
                  components.forEach((component, index) => {
                      component.setReaction('barrier');
                  });    
                  reactionFA = "Hindernis";              
            }
            let event = new CustomEvent('componentChanged', { detail: entity });
            document.dispatchEvent(event);
        });

}

function drawSliders(components) {
    $('#slidecontainer').children().each((idx, child) => {
        child.remove('div');
    });
    $('#slidecontainerForAll').children().each((idx, child) => {
        child.remove('div');
    });
    if (!components.length) {
        return
    }
    components.forEach(component => {
        $("#slidecontainer").append('<div id = "' + component.id + '" class="slider">');
    });
        $("#slidecontainerForAll").append('<div id = "sliderForAll" class="slider">');
 
    components.forEach((component,index) => {
        var slider = $(function () {
            $("#" + component.id).slider({
                range: true,
                min: 0,
                max: 100,
                step: 10,
                values: [component.defaultSpeed.get(), component.maxSpeed.get()],
                slide: function (event, ui) {

                $("#" + component.id).val("$" + ui.values[0] + " - $" + ui.values[1]);
                component.setDefaultSpeed(ui.values[0]);
                component.setMaxSpeed(ui.values[1]);
                }
            });
            $("#" + component.id + " .ui-widget-header").css('background', color[index]);
            
        });    
    });
$(function () {
            $("#sliderForAll").slider({
                range: true,
                min: 0,
                max: 100,
                step: 10,
                values: [defaultSpeedFA, maxSpeedFA],
                slide: function (event, ui) {

                $("#sliderForAll").val("$" + ui.values[0] + " - $" + ui.values[1]);
                components.forEach((component, index)=>{
                    component.setDefaultSpeed(ui.values[0]);
                    component.setMaxSpeed(ui.values[1]);
                $( "#" + component.id + "" ).slider('values', [ui.values[0],ui.values[1]]);
                });  
                    defaultSpeedFA = ui.values[0];
                    maxSpeedFA = ui.values[1]; 
               }
            });            
        }); 
}



$(document).on("settigs:closed", function (event, options) {

    let ev = new CustomEvent("closeSetting", {});
    document.dispatchEvent(ev);

});


function closeSettings() {

    document.getElementById("myEntitySettings").style.width = "0";
    document.getElementById("createEntityMenu").style.marginRight = "60px";
    $(document).trigger('settings:closed', []);
}     

function openNav() {
    closeSettings();
    document.getElementById("mySidenav").style.width = "256px";		
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}




/*
* GLOBAL EVENTS
*/

//add motor event
$(document).on("motor:add", function (event, options) {

    let ev = new CustomEvent("addMotor", {
        detail: {
            position: options
        }
    });
    document.dispatchEvent(ev);
    
});

//del motor event
$(document).on("motor:del", function (event, options) {

    var index = motorComponents.map(x => {
        return x.id;
    }).indexOf(options.id);


    console.log("delete motor", motorComponents[index]);


    let ev = new CustomEvent("deleteMotor", {
        detail: {
            component:  motorComponents[index]
        }
    });
    document.dispatchEvent(ev);

});

//update motor event
$(document).on("motor:upd", function (event, options) {

    var index = motorComponents.map(x => {
        return x.id;
    }).indexOf(options.id);

    motorComponents[index].setPosition(options.x, options.y);
});







/*
* GLOBAL VARS
*/

//color array this is unsafe because the array is of fixed size!
//this needs a better solution!
var color = ["#00ffff", "#00ff00", "#ff00ff", "#cecece", "#cece00", "#ce00ce", "#00cece", "#c00ece", "#cec00e", "#0000ce"];

var col = {};


function generateHexColor() {

    let colr = '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
    console.log("tsvet", colr);
    return colr;
}





var motorCanvasStage = new Konva.Stage({
    container: 'motorCanvasContainer'
});

/*
* FUNCTIONS
*/

function paintMotorCanvas() {

    motorComponents.forEach(motor => {
        if (Math.abs(motor.position.value.x) > size.width / 2) {
            motor.setPosition(size.width / 2, motor.position.value.y )
        }
        if (Math.abs(motor.position.value.y) > size.height / 2) {
            motor.setPosition(motor.position.value.x, size.height / 2)
        }    
    });
   

    drawMotorCanvas({
        components: motorComponents, //entity.components.filter(component => component.name == "Motor"),
        size: size, //real: solidBodyComponents[0].size.value; ?
        width: 240,
        height: 200,
        grid: {
            offset: {
                x: 20,
                y: 20
            },
            padding: 20,
            size: {
                x: 6,
                y: 8
            }
        }
    });
}

function drawMotorCanvas(options) {
    motorCanvasStage.destroyChildren();
    motorCanvasStage.width(options.width);
    motorCanvasStage.height(options.height);

    let gridHeight = options.grid.size.y * options.grid.padding;
    let gridWidth = options.grid.size.x * options.grid.padding;
    let corners = {
        x: {
            min: options.grid.offset.x,
            max: gridWidth + options.grid.padding,
        },
        y: {
            min: options.grid.offset.y,
            max: gridHeight + options.grid.padding,
        },
    };
    let startPoint = { 'x': (gridWidth) / 2 + options.grid.padding, 'y': (gridHeight) / 2 + options.grid.padding };
    let ratioX = 1;
    let ratioY = 1;
    if (options.size) {
        ratioX = (gridWidth) / options.size.width;

        //console.log("ratioX grid width size.width motor", ratioX ,gridWidth,options.size.width);

        ratioY = (gridHeight) / options.size.height;
    }

    let gridLayer = new Konva.Layer();
    for (let i = 0; i <= options.grid.size.x; i++) {
        gridLayer.add(new Konva.Line({
            points: [options.grid.offset.x + i * options.grid.padding, options.grid.offset.y, options.grid.offset.x + i * options.grid.padding, gridHeight + options.grid.offset.y],
            stroke: '#ddd',
            strokeWidth: 0.5,
        }));
    }
    for (let j = 0; j <= options.grid.size.y; j++) {
        gridLayer.add(new Konva.Line({
            points: [options.grid.offset.x, options.grid.offset.y + j * options.grid.padding, gridWidth + options.grid.offset.x, options.grid.offset.y + j * options.grid.padding],
            stroke: '#ddd',
            strokeWidth: 0.5,
        }));
    }
    motorCanvasStage.add(gridLayer);

    let pointLayer = new Konva.Layer();
    for (let i = 0; i <= options.grid.size.x; i++) {
        for (let j = 0; j <= options.grid.size.y; j++) {
            let x = options.grid.offset.x + options.grid.padding * i;
            let y = options.grid.offset.y + options.grid.padding * j;
            pointLayer.add(new Konva.Circle({
                x: x,
                y: y,
                radius: 2,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 0
            }));
        }
    }
    motorCanvasStage.add(pointLayer);

    let shadowLayer = new Konva.Layer();
    let shadowCircle = new Konva.Circle({
        x: 40,
        y: 40,
        radius: 3,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 0,
        id: 'shadowCircle'

    });
    shadowCircle.hide();
    shadowLayer.add(shadowCircle);
    motorCanvasStage.add(shadowLayer);

    let optionsLayer = new Konva.Layer();
    let bin = new Konva.Rect({
        x: 180,
        y: 150,
        width: 30,
        height: 30,
        fill: 'grey',
        stroke: 'black',
        strokeWidth: 4,
        draggable: false
    });
    optionsLayer.add(bin);

    let addMotor = new Konva.Circle({
        x: 190,
        y: 40,
        radius: 7,
        fill: '#e5e5e5',
        stroke: 'black',
        strokeWidth: 1,
        id: 'addMotor',
        draggable: true
    });
    addMotor.on('dragstart', (e) => {
        shadowCircle.show();
        motorCanvasStage.batchDraw();
    });
    addMotor.on('dragend', (e) => {

        // x: startPoint.x - ratioX * component.position.value.x,
        //    y: startPoint.y - ratioY * component.position.value.y,

        $(document).trigger('motor:add', [{
            x: -1 * (Math.min(corners.x.max, Math.max(corners.x.min, Math.round(addMotor.x() / options.grid.padding) * options.grid.padding)) - startPoint.x) / ratioX,
            y: -1 * (Math.min(corners.y.max, Math.max(corners.y.min, Math.round(addMotor.y() / options.grid.padding) * options.grid.padding)) - startPoint.y) / ratioY
        }]);
        addMotor.position({
            x: 190,
            y: 40
        });
        shadowCircle.hide();
        motorCanvasStage.batchDraw();
    });
    addMotor.on('dragmove', (e) => {
        shadowCircle.position({
            x: Math.min(corners.x.max, Math.max(corners.x.min, Math.round(addMotor.x() / options.grid.padding) * options.grid.padding)),
            y: Math.min(corners.y.max, Math.max(corners.y.min, Math.round(addMotor.y() / options.grid.padding) * options.grid.padding))
        });
        motorCanvasStage.batchDraw();
    });
    optionsLayer.add(addMotor);
    motorCanvasStage.add(optionsLayer);

    let motorLayer = new Konva.Layer();
    let colorCounter = 0;

    options.components.forEach(component => {
        col[component.id] = generateHexColor();
        let motor = new Konva.Circle({
            x: startPoint.x - ratioX * component.position.value.x,
            y: startPoint.y - ratioY * component.position.value.y,
            radius: 7,
            fill: color[colorCounter], //col[component.id],
            stroke: 'black',
            strokeWidth: 1,
            id: component.id,
            name: "Motor",
            draggable: true
        });
        

        motor.on('dragstart', (e) => {
            shadowCircle.show();
            motorCanvasStage.batchDraw();
        });
        motor.on('dragend', (e) => {
            if (!haveIntersection(e.target.getClientRect(), bin.getClientRect())) {

                motor.position({
                    x: Math.min(corners.x.max, Math.max(corners.x.min, Math.round(motor.x() / options.grid.padding) * options.grid.padding)),
                    y: Math.min(corners.y.max, Math.max(corners.y.min, Math.round(motor.y() / options.grid.padding) * options.grid.padding))
                });

                //console.log("dragend motor ratio X Y startpoint size", motor.position(), ratioX, ratioY, startPoint, size);

                $(document).trigger('motor:upd', [{
                    id: motor.id(),
                    x: -1 * (motor.x() - startPoint.x) / ratioX,
                    y: -1 * (motor.y() - startPoint.y) / ratioY
                }]);
            } else {
                bin.fill('grey');
                e.target.destroy();
                $(document).trigger('motor:del', [{ id: motor.id() }]);
            }
            shadowCircle.hide();
            motorCanvasStage.batchDraw();
        });
        motor.on('dragmove', (e) => {
            if (!haveIntersection(e.target.getClientRect(), bin.getClientRect())) {
                shadowCircle.show();
                bin.fill('grey');
                shadowCircle.position({
                    x: Math.min(corners.x.max, Math.max(corners.x.min, Math.round(motor.x() / options.grid.padding) * options.grid.padding)),
                    y: Math.min(corners.y.max, Math.max(corners.y.min, Math.round(motor.y() / options.grid.padding) * options.grid.padding))
                });
            } else {
                bin.fill('red');
                shadowCircle.hide();
            }
            motorCanvasStage.batchDraw();
        });
        colorCounter++;
        motorLayer.add(motor);
    });
    motorCanvasStage.add(motorLayer);

    gridLayer.zIndex(0);
    pointLayer.zIndex(1);
    optionsLayer.zIndex(2);
    motorLayer.zIndex(3);
    shadowLayer.zIndex(4);
}

function haveIntersection(r1, r2) {
    return !(
        r2.x > r1.x + r1.width ||
        r2.x + r2.width < r1.x ||
        r2.y > r1.y + r1.height ||
        r2.y + r2.height < r1.y
    );
}




/*
* GLOBAL EVENTS
*/

//add sensor event
$(document).on("sensor:add", function (event, options) {

    let ev = new CustomEvent("addSensor", {
        detail: {
            position: options
        }
    });
    document.dispatchEvent(ev);

});

//del sensor event
$(document).on("sensor:del", function (event, options) {

    var index = sensorComponents.map(x => {
        return x.id;
    }).indexOf(options.id);


    console.log("delete sensor",sensorComponents[index]);


    let ev = new CustomEvent("deleteSensor", {
        detail: {
            component: sensorComponents[index]
        }
    });
    document.dispatchEvent(ev);

});

//update sensor event
$(document).on("sensor:upd", function (event, options) {

    var index = sensorComponents.map(x => {
        return x.id;
    }).indexOf(options.id);

   sensorComponents[index].setPosition(options.x, options.y);
});







/*
* GLOBAL VARS
*/

//color array this is unsafe because the array is of fixed size!
//this needs a better solution!

var sensorCanvasStage = new Konva.Stage({
    container: 'sensorCanvasContainer'
});

/*
* FUNCTIONS
*/

function paintSensorCanvas() {

    sensorComponents.forEach(sensor => {
        if (Math.abs(sensor.position.value.x) > size.width / 2) {
            sensor.setPosition(size.width / 2, sensor.position.value.y)
        }
        if (Math.abs(sensor.position.value.y) > size.height / 2) {
            sensor.setPosition(sensor.position.value.x, size.height / 2)
        }
    });


    drawSensorCanvas({
        components: sensorComponents, //entity.components.filter(component => component.name == "Motor"),
        size: size, //real: solidBodyComponents[0].size.value; ?
        width: 240,
        height: 200,
        grid: {
            offset: {
                x: 20,
                y: 20
            },
            padding: 20,
            size: {
                x: 6,
                y: 8
            }
        }
    });
}

function drawSensorCanvas(options) {
    sensorCanvasStage.destroyChildren();
    sensorCanvasStage.width(options.width);
    sensorCanvasStage.height(options.height);

    let gridHeight = options.grid.size.y * options.grid.padding;
    let gridWidth = options.grid.size.x * options.grid.padding;
    let corners = {
        x: {
            min: options.grid.offset.x,
            max: gridWidth + options.grid.padding,
        },
        y: {
            min: options.grid.offset.y,
            max: gridHeight + options.grid.padding,
        },
    };

    let startPoint = { 'x': (gridWidth) / 2 + options.grid.padding, 'y': (gridHeight) / 2 + options.grid.padding };
    let ratioX = 1;
    let ratioY = 1;
    if (options.size) {
        ratioX = (gridWidth) / options.size.width;
        //console.log("ratioX grid width size.width sensor", ratioX, gridWidth, options.size.width);

        ratioY = (gridHeight) / options.size.height;
    }

    let gridLayer = new Konva.Layer();
    for (let i = 0; i <= options.grid.size.x; i++) {
        gridLayer.add(new Konva.Line({
            points: [options.grid.offset.x + i * options.grid.padding, options.grid.offset.y, options.grid.offset.x + i * options.grid.padding, gridHeight + options.grid.offset.y],
            stroke: '#ddd',
            strokeWidth: 0.5,
        }));
    }
    for (let j = 0; j <= options.grid.size.y; j++) {
        gridLayer.add(new Konva.Line({
            points: [options.grid.offset.x, options.grid.offset.y + j * options.grid.padding, gridWidth + options.grid.offset.x, options.grid.offset.y + j * options.grid.padding],
            stroke: '#ddd',
            strokeWidth: 0.5,
        }));
    }
    sensorCanvasStage.add(gridLayer);

    let pointLayer = new Konva.Layer();
    for (let i = 0; i <= options.grid.size.x; i++) {
        for (let j = 0; j <= options.grid.size.y; j++) {
            let x = options.grid.offset.x + options.grid.padding * i;
            let y = options.grid.offset.y + options.grid.padding * j;

            if (x === corners.x.min || x === corners.x.max || y === corners.y.min || y === corners.y.max) {
                pointLayer.add(new Konva.Circle({
                    x: x,
                    y: y,
                    radius: 2,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 0
                }));
            }
           
        }
    }
   sensorCanvasStage.add(pointLayer);

    let shadowLayer = new Konva.Layer();
    let shadowCircle = new Konva.Circle({
        x: 20,
        y: 20,
        radius: 3,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 0,
        id: 'shadowCircle'

    });
    shadowCircle.hide();
    shadowLayer.add(shadowCircle);
    sensorCanvasStage.add(shadowLayer);

    let optionsLayer = new Konva.Layer();
    let bin = new Konva.Rect({
        x: 180,
        y: 150,
        width: 30,
        height: 30,
        fill: 'grey',
        stroke: 'black',
        strokeWidth: 4,
        draggable: false
    });
    optionsLayer.add(bin);

    let addSensor = new Konva.RegularPolygon({
        x: 190,
        y: 40,
        radius: 10,
        sides: 3,
        rotation: 180,
        fill: '#e5e5e5',
        stroke: 'black',
        strokeWidth: 1,
        id: 'addSensor',
        draggable: true
    });
    addSensor.on('dragstart', (e) => {
        shadowCircle.show();
        sensorCanvasStage.batchDraw();
    });
    addSensor.on('dragend', (e) => {

        // x: startPoint.x - ratioX * component.position.value.x,
        //    y: startPoint.y - ratioY * component.position.value.y,

        let newX = Math.min(corners.x.max, Math.max(corners.x.min, Math.round(addSensor.x() / options.grid.padding) * options.grid.padding));
        let newY = Math.min(corners.y.max, Math.max(corners.y.min, Math.round(addSensor.y() / options.grid.padding) * options.grid.padding));
        let minDistToX = Math.min(Math.abs(newX - corners.x.min), Math.abs(newX - corners.x.max));
        let minDistToY = Math.min(Math.abs(newY - corners.y.min), Math.abs(newY - corners.y.max));

        if (minDistToX <= minDistToY) {

            newX = Math.abs(newX - corners.x.min) >= Math.abs(newX - corners.x.max) ? corners.x.max : corners.x.min;
        } else {
            newY = Math.abs(newY - corners.y.min) >= Math.abs(newY - corners.y.max) ? corners.y.max : corners.y.min;
        }

        $(document).trigger('sensor:add', [{
            x: -1 * (newX - startPoint.x) / ratioX,
            y: -1 * (newY - startPoint.y) / ratioY
        }]);
        addSensor.position({
            x: 190,
            y: 40
        });
        shadowCircle.hide();
        sensorCanvasStage.batchDraw();
    });
    addSensor.on('dragmove', (e) => {

        let newX = Math.min(corners.x.max, Math.max(corners.x.min, Math.round(addSensor.x() / options.grid.padding) * options.grid.padding));
        let newY = Math.min(corners.y.max, Math.max(corners.y.min, Math.round(addSensor.y() / options.grid.padding) * options.grid.padding));
        let minDistToX = Math.min(Math.abs(newX - corners.x.min), Math.abs(newX - corners.x.max));
        let minDistToY = Math.min(Math.abs(newY - corners.y.min), Math.abs(newY - corners.y.max));

        if (minDistToX <= minDistToY) {

            newX = Math.abs(newX - corners.x.min) >= Math.abs(newX - corners.x.max) ? corners.x.max : corners.x.min;
        } else {
            newY = Math.abs(newY - corners.y.min) >= Math.abs(newY - corners.y.max) ? corners.y.max : corners.y.min;
        }

        shadowCircle.position({ x: newX, y: newY });
        sensorCanvasStage.batchDraw();
    });
    optionsLayer.add(addSensor);
    sensorCanvasStage.add(optionsLayer);

    let sensorLayer = new Konva.Layer();
    let colorCounter = 0;

    options.components.forEach(component => {
        let sensor = new Konva.RegularPolygon({
            x: startPoint.x - ratioX * component.position.value.x,
            y: startPoint.y - ratioY * component.position.value.y,
            radius: 10,
            sides: 3,  
            rotation: 180,
            fill: color[colorCounter],
            stroke: 'black',
            strokeWidth: 1,
            id: component.id,
            name: "Sensor",
            draggable: true
        });


        if ((sensor.x != corners.x.min || sensor.x != corners.x.max) && (sensor.y != corners.y.min || sensor.y != corners.y.max)) {
            let newX = Math.min(corners.x.max, Math.max(corners.x.min, Math.round(sensor.x() / options.grid.padding) * options.grid.padding));
            let newY = Math.min(corners.y.max, Math.max(corners.y.min, Math.round(sensor.y() / options.grid.padding) * options.grid.padding));
            let minDistToX = Math.min(Math.abs(newX - corners.x.min), Math.abs(newX - corners.x.max));
            let minDistToY = Math.min(Math.abs(newY - corners.y.min), Math.abs(newY - corners.y.max));

            if (minDistToX <= minDistToY) {

                newX = Math.abs(newX - corners.x.min) >= Math.abs(newX - corners.x.max) ? corners.x.max : corners.x.min;
            } else {
                newY = Math.abs(newY - corners.y.min) >= Math.abs(newY - corners.y.max) ? corners.y.max : corners.y.min;
            }

            sensor.position({ x: newX, y: newY });
            $(document).trigger('sensor:upd', [{
                id: sensor.id(),
                x: -1 * (newX - startPoint.x) / ratioX,
                y: -1 * (newY - startPoint.y) / ratioY
            }]);
        }




        sensor.on('dragstart', (e) => {
            shadowCircle.show();
            sensorCanvasStage.batchDraw();
        });
        sensor.on('dragend', (e) => {
            if (!haveIntersection(e.target.getClientRect(), bin.getClientRect())) {
                

                let newX = Math.min(corners.x.max, Math.max(corners.x.min, Math.round(sensor.x() / options.grid.padding) * options.grid.padding));
                let newY = Math.min(corners.y.max, Math.max(corners.y.min, Math.round(sensor.y() / options.grid.padding) * options.grid.padding));
                let minDistToX = Math.min(Math.abs(newX - corners.x.min), Math.abs(newX - corners.x.max));
                let minDistToY = Math.min(Math.abs(newY - corners.y.min), Math.abs(newY - corners.y.max));

                if (minDistToX <= minDistToY) {

                    newX = Math.abs(newX - corners.x.min) >= Math.abs(newX - corners.x.max) ? corners.x.max : corners.x.min;
                } else {
                    newY = Math.abs(newY - corners.y.min) >= Math.abs(newY - corners.y.max) ? corners.y.max : corners.y.min;
                }

                sensor.position({x: newX, y: newY});
                
                //console.log("dragend sensor ratio X Y startpoint size", motor.position(), ratioX, ratioY, startPoint, size);

                $(document).trigger('sensor:upd', [{
                    id: sensor.id(),
                    x: -1 * (newX - startPoint.x) / ratioX,
                    y: -1 * (newY - startPoint.y) / ratioY
                }]);
            } else {
                bin.fill('grey');
                e.target.destroy();
                $(document).trigger('sensor:del', [{ id: sensor.id() }]);
            }
            shadowCircle.hide();
            sensorCanvasStage.batchDraw();
        });
        sensor.on('dragmove', (e) => {
            if (!haveIntersection(e.target.getClientRect(), bin.getClientRect())) {


                shadowCircle.show();
                bin.fill('grey');

                let newX = Math.min(corners.x.max, Math.max(corners.x.min, Math.round(sensor.x() / options.grid.padding) * options.grid.padding));
                let newY = Math.min(corners.y.max, Math.max(corners.y.min, Math.round(sensor.y() / options.grid.padding) * options.grid.padding));
                let minDistToX = Math.min(Math.abs(newX - corners.x.min), Math.abs(newX - corners.x.max));
                let minDistToY = Math.min(Math.abs(newY - corners.y.min), Math.abs(newY - corners.y.max));

                if (minDistToX <= minDistToY) {

                    newX = Math.abs(newX - corners.x.min) >= Math.abs(newX - corners.x.max) ? corners.x.max : corners.x.min;
                } else {
                    newY = Math.abs(newY - corners.y.min) >= Math.abs(newY - corners.y.max) ? corners.y.max : corners.y.min;
                }

                shadowCircle.position({ x: newX, y: newY });
                
            } else {
                bin.fill('red');
                shadowCircle.hide();
            }
            sensorCanvasStage.batchDraw();
        });
        colorCounter++;
        sensorLayer.add(sensor);
    });
    sensorCanvasStage.add(sensorLayer);

    gridLayer.zIndex(0);
    pointLayer.zIndex(1);
    optionsLayer.zIndex(2);
    sensorLayer.zIndex(3);
    shadowLayer.zIndex(4);
}
