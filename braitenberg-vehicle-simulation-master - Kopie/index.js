
var entity = null;
var color = ["#00ffff", "#00ff00", "#ff00ff", "#cecece", "#cece00", "#ce00ce", "#00cece", "#c00ece", "#cec00e", "#0000ce"];

document.addEventListener("entitySelected", openSettings);
document.addEventListener("attributeAdded", openSettings);

function openSettings(event) {
    closeNav();
    //closeSettings();
    document.getElementById("myEntitySettings").style.width = "256px";
    document.getElementById("createEntityMenu").style.marginRight = "306px";

    entity = event.detail;                  // die aufgerufene Entität
    console.log(entity);

    var motorComponents = entity.components.filter(component => component.name == "Motor");
    var sensorComponents = entity.components.filter(component => component.name == "Sensor");
    var renderComponents = entity.components.filter(component => component.name == "Rendering");
    var solidBodyComponents = entity.components.filter(component => component.name == "Koerper");
    var sourceComponents = entity.components.filter(component => component.name == "Quelle");
    var transformableComponents = entity.components.filter(component => component.name == "Transform");
    var connectionComponents = entity.components.filter(component => component.name == "Verbindung");

    var size = { "width": 100, "height": 150 };
    if (solidBodyComponents[0]) {
        size = solidBodyComponents[0].size.value;
    }


    drawOnCanvas(motorComponents, "Motor", size);
    drawSliders(motorComponents);

    drawOnCanvas(sensorComponents, "Sensor", size);

    sensorSettings(sensorComponents);
    console.log("opensettings");
    bodySettings(solidBodyComponents, renderComponents);
    emissionSettings(sourceComponents);
}

function emissionSettings(sourceComponents) {
    if (sourceComponents.length){
        $('#static.switch-btn').addClass("switch-on");

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
        }
        if(sourceComponents[0].emissionType.value ==="FLAT") {
            $("#gaus").prop('checked', false);
            $("#flat").prop('checked', true);
        }        
    } else {
        $('#static.switch-btn').removeClass("switch-on");

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

    // wenn SolidBodyComponent vorhanden, den Button auf ON setzten
    if (components.length) {
        $("#static").prop('disabled', false); 
        $('#solidBody.switch-btn').addClass("switch-on");

        if (components[0].isStatic.get()){
            $('#static.switch-btn').addClass("switch-on");
        } else {
            $('#static.switch-btn').removeClass("switch-on");
        }

        $("#rectangle").prop('disabled', false); 
        $("#circle").prop('disabled', false); 

        if (components[0].shape.value === "Rechteck") {
            $("#rectangle").prop('checked', true);
        } else if (components[0].shape.value === "Kreis") {
            $("#circle").prop('checked', true);
        }

        // die aktuelle Breite und Hoehe der Entität anzeigen
        $("#width").val(components[0].size.value.width);
        $("#height").val(components[0].size.value.height);

        $("#width").change(function () {
            let newValue = $("#width").val(); // get the current value of the input field.
            components[0].setSize({ width: parseInt(newValue), height: components[0].size.value.height });
        });

        $("#height").change(function () {
            let newValue = $("#height").val(); // get the current value of the input field.
            components[0].setSize({ width: components[0].size.value.width, height: parseInt(newValue)});
        });

    } else {
        $('#solidBody.switch-btn').removeClass("switch-on");
        $("#rectangle").prop('checked', false);
        $("#rectangle").prop('disabled', true); 
        $("#circle").prop('checked', false);
        $("#circle").prop('disabled', true); 

        
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

        // ne rabotaet podklu4it bootstrap toggle?
        $("#sensorReaction").append('<input type="checkbox" data-toggle="toggle" data-on="on" data-off="off" data-onstyle="success" data-offstyle="danger">');
            
        $('#range' + component.id).on('input', function () {
            let newValue = $(this).val(); // get the current value of the input field.
            //console.log(newValue);
            component.setRange(newValue);
        });
        $('#angle' + component.id).on('input', function () {
            let newValue = $(this).val(); // get the current value of the input field.
            component.setAngle(newValue);
        });
    });
    
}

// TODO  size from solidBody? render??
function drawOnCanvas(components, cName, size) {
    (function () {
        var canvas = this.__canvas = new fabric.Canvas('motorCanvas', { selection: false });
        fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
        console.log("sdfsd", fabric.Object.prototype.originX);

        function makeCircle(left, top, id) {
            var c = new fabric.Triangle({
                left: left,
                top: top,
                strokeWidth: 2,
                width: 10, height: 10, angle: 180,
                id: id,
                fill: '#ccc',
                stroke: '#666'
            });
            c.hasControls = false;
            c.hasBorders = true;



            return c;
        }

        function makeLine(coords) {
            return new fabric.Line(coords, {
                fill: 'red',
                stroke: 'red',
                strokeWidth: 5,
                selectable: false,
                evented: false,
            });
        }

        //var line = makeLine([ 250, 125, 250, 175 ]),
        //  line2 = makeLine([ 250, 175, 250, 250 ]),
        //line3 = makeLine([ 250, 250, 300, 350]),
        //line4 = makeLine([ 250, 250, 200, 350]),
        //line5 = makeLine([ 250, 175, 175, 225 ]),
        //line6 = makeLine([ 250, 175, 325, 225 ]);
        var c1 = makeCircle(0, 0, 1),
            c2 = makeCircle(0, 50, 2),
            c3 = makeCircle(50, 0, 3)

        canvas.add(c1, c2, c3);

        canvas.on({
            'mouse:down': function (e) {
                if (e.target) {
                    e.target.opacity = 0.5;
                    canvas.renderAll();
                }
            },
            'mouse:up': function (e) {
                if (e.target) {
                    e.target.opacity = 1;
                    console.log(e.target.id);
                    e.target.top = 200;
                    canvas.renderAll();
                }
            },
            'object:moved': function (e) {
                e.target.opacity = 0.5;
            },
            'object:modified': function (e) {
                e.target.opacity = 1;
            }
        });
    })();


    /*var motors = [];

    console.log($("#sensorContainer").child);
    //$("#sensorContainer").append('<canvas id="sensorCanvas"> </canvas>');


    var canvas;
    if (cName == "Motor") {
        canvas = document.getElementById("motorCanvas");
    }
    if (cName == "Sensor") {
        canvas = document.getElementById("sensorCanvas");
    }

    canvas.width = 256;
    canvas.height = 256;
    var width = 100 + 20,
        height =  150 + 20,
        ratioX = ratioY = 1;
    if (size) {
        ratioX = (width-20) / size.width;
        ratioY = (height-20) / size.height;
    } 
       
    var context = canvas.getContext("2d"),
        // TODO hier size einsetzen
        startPoint = { "x": width / 2, "y": height / 2 },
        offset = {},
        isDragging = false,
        dragHandle = null;
    let i = 0;

    components.forEach(component => {
        let motor = {
            x: startPoint.x - ratioX * component.position.value.x,
            y: startPoint.y - ratioY * component.position.value.y,
            radius: 7,
            id: component.id,
            color: color[i],
            name: cName
        };
        i++;
        motors.push(motor);        
    });

    console.log("motors on canvas", motors);

    draw();

    function draw() {
        context.clearRect(0, 0, width, height);
        context.strokeRect(10, 10, width - 20, height - 20);
        
        for (let i = 0; i < motors.length; i += 1) {
            context.fillStyle = color[i];
            let motor = motors[i];
            if (isDragging && motor === dragHandle) {
                context.shadowColor = "black";
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowBlur = 8;
            }

            if (motor.name == "Motor") {
                context.beginPath();
                context.arc(motor.x, motor.y, motor.radius, 0, Math.PI * 2, false);
                context.fill();
                context.stroke();
            }

            if (motor.name == "Sensor") {
                context.beginPath();
                context.moveTo(motor.x - 7, motor.y - 10);
                context.lineTo(motor.x, motor.y);
                context.lineTo(motor.x + 7, motor.y - 10);
                context.closePath();
                context.fill();
                context.stroke();
            }

            context.shadowColor = null;
            context.shadowOffsetX = null;
            context.shadowOffsetY = null;
            context.shadowBlur = null;

            // Richtungsanzeige
            context.beginPath();
            context.moveTo(startPoint.x, 20);
            context.lineTo(startPoint.x - 10, 25);
            context.lineTo(startPoint.x + 10, 25);
            context.closePath();
            context.fillStyle = "#cccccc";
            context.fill();            
        }

        // Grid motor
        if (cName === "Motor") {
            for (let i = 10; i < width; i += 10) {
                for (let j = 10; j < height; j += 10) {
                    context.fillStyle = "#cccccc";
                    context.beginPath();
                    context.arc(i, j, 1, 0, 2 * Math.PI, true);
                    context.fill();
                    context.stroke();
                }
            }
        }
        // show possible points for sensor
        if (cName === "Sensor") {
            for (let i = 10; i < width; i += 10) {
                for (let j = 10; j < height; j += 10) {
                    if (i == 10 || i == width - 10 || j == 10 || j == height - 10) {
                        context.fillStyle = "#cccccc";
                        context.beginPath();
                        context.arc(i, j, 1, 0, 2 * Math.PI, true);
                        context.fill();
                        context.stroke();
                    }

                }
            }
        }
       
    }

    canvas.addEventListener("mousedown", function (event) {
        motors.forEach(function (motor) {
            if (circlePointCollision(event.offsetX, event.offsetY, motor)) {
                isDragging = true;
                canvas.addEventListener("mousemove", onMouseMove);
                canvas.addEventListener("mouseup", onMouseUp);
               // canvas.addEventListener("mouseout", onMouseOut);
                dragHandle = motor;
                offset.x = event.clientX - motor.x;
                offset.y = event.clientY - motor.y;
                draw();

            }
        });

    });

    function onMouseMove(event) {
        dragHandle.x = event.clientX - offset.x;
        dragHandle.y = event.clientY - offset.y;
        draw();
    }

    function onMouseOut(event) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseout", onMouseOut);
      
        console.log("out event", event);
        let deleteButton = $("#deleteSensor");
        //if (component.isDeletable()) {
        let cmp, idx;
        components.forEach((component, index) => {
            if (component.id === dragHandle.id) {
                cmp = component;
                console.log("deleteble cmp", cmp);
            }
        });

       components.splice(idx,1);

        deleteButton.on("mouseenter", function () {
            let deleteEvent = new CustomEvent("delete", { detail: cmp });
            //document.dispatchEvent(deleteEvent);           
        });
       
        drawOnCanvas(components, "Sensor", size);
    }


    function onMouseUp(event) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseout", onMouseOut);
        isDragging = false;

        let newX = nearest(startPoint.x - dragHandle.x, 10);
        let newY = nearest(startPoint.y - dragHandle.y, 10) - 5;
        console.log("mouseup, cmps id vs draghandle id ", newX, dragHandle.id);
        motors.forEach(m => {
            if (dragHandle != m && m.x == dragHandle.x && m.y == dragHandle.y) {
                newX += 10; 
                newY += 10;
            }

            if (m.id == dragHandle.id) {
                m.x = startPoint.x - newX;
                m.y = startPoint.y - newY;


            }

        });

        components.forEach(c => {
            if (c.id == dragHandle.id) {
                
                c.setPosition(newX / ratioX, newY / ratioY);
               
            }
        });
        
        //console.log("test_set");
        draw();

    }

    function nearest(value, n) {
        return Math.round(value / n) * n;
    }

    function distanceXY(x0, y0, x1, y1) {
        var dx = x1 - x0,
            dy = y1 - y0;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function circlePointCollision(x, y, circle) {
        return distanceXY(x, y, circle.x, circle.y) < circle.radius;
    }*/
}



function drawSliders(components) {
   $('#slidecontainer').children().each((idx, child) => {
            child.remove('div');
        }); 
    components.forEach(component => {
        $("#slidecontainer").append('<div id = "' + component.id + '" class="slider">');
    });
 
components.forEach((component,index) => {
        var slider = $(function () {
            $("#" + component.id).slider({
                range: true,
                min: 0,
                max: 100,
                values: [component.defaultSpeed.get(), component.maxSpeed.get()],
                slide: function (event, ui) {
                
                component.setDefaultSpeed(ui.values[0]);
                component.setMaxSpeed(ui.values[1]);
                $("#" + component.id).val("$" + ui.values[0] + " - $" + ui.values[1]);

                }
            });
            $("#" + component.id).css('background', color[index]);
            
            });
        });
    
}



function closeSettings() {
    document.getElementById("myEntitySettings").style.width = "0";
    document.getElementById("createEntityMenu").style.marginRight = "60px";
}     

function openNav() {
    closeSettings();
    document.getElementById("mySidenav").style.width = "256px";		
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
