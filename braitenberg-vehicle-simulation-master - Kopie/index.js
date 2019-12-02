
var entity = null;
var color = ["#00ffff", "#00ff00", "#ff00ff", "#cecece"];


document.addEventListener("entitySelected", openSettings);

function openSettings(event) {
    closeNav();
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

    console.log(solidBodyComponents);
    drawOnCanvas(motorComponents, "Motor", solidBodyComponents[0].size.value);
    drawSliders(motorComponents);

    drawOnCanvas(sensorComponents, "Sensor", solidBodyComponents[0].size.value);

    numberInput(sensorComponents);

}


function numberInput(components) {
    let i = 0;
    components.forEach(function (component) {
        $("#sensorRange").append(
            '<input id = "range' + component.id + '" style = "background: ' + color[i] +
            '; margin-bottom:10px" placeholder = "' + component.range.value + '"> </input>');
        $("#sensorAngle").append(
            '<input id = "angle' + component.id + '" style = "background: ' + color[i] +
            '; margin-bottom:10px" placeholder = "' + component.angle.value + '"> </input>');

        //ne rabotaet podklu4it bootstrap toggle?
        $("#sensorReaction").append('<input type="checkbox" data-toggle="toggle" data-on="Light" data-off="Barrier" data-onstyle="success" data-offstyle="danger">');

        i++;
        $('#range' + component.id).on('input', function () {
            let newValue = $(this).val(); // get the current value of the input field.
            console.log(newValue);
            component.setRange(newValue);
        });
        $('#angle' + component.id).on('input', function () {
            let newValue = $(this).val(); // get the current value of the input field.
            console.log(newValue);
            component.setAngle(newValue);
        });
        
    });
}

// TODO  size from solidBody? render??
function drawOnCanvas(components, cName, size) {
    var motors = [];

    var canvas;
    if (cName == "Motor") {
        canvas = document.getElementById("motorCanvas");
    }
    if (cName == "Sensor") {
        canvas = document.getElementById("sensorCanvas");
    }

    var width = canvas.width = 100 + 20,
        height = canvas.height = 150 + 20,
        ratioX = ratioY = 1;
    if (size) {
        ratioX = canvas.width / size.width;
        ratioY = canvas.height / size.height;
    } 
       
    var context = canvas.getContext("2d"),
        // TODO hier size einsetzen
        startPoint = { "x": canvas.width / 2, "y": canvas.height / 2 },
        offset = {},
        isDragging = false,
        dragHandle = null;
    let i = 0;

    components.forEach(component => {
        let motor = {
            x: startPoint.x - ratioX * component.position.value.x,
            y: startPoint.y - ratioY * component.position.value.y,
            radius: 5,
            id: component.id,
            color: color[i],
            name: cName
        };
        i++;
        motors.push(motor);        
    });

    //console.log(motors);

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
                dragHandle = motor;
                offset.x = event.clientX - motor.x;
                offset.y = event.clientY - motor.y;
                //console.log("down", event.clientX);
                draw();

            }
        });

    });

    function onMouseMove(event) {
        dragHandle.x = event.clientX - offset.x;
        dragHandle.y = event.clientY - offset.y;
        //console.log("move", dragHandle.x);

        draw();
       
    }

    function onMouseUp(event) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        isDragging = false;
        console.log("up", startPoint.x , dragHandle.x);
        let newX = nearest(startPoint.x - dragHandle.x, 10);
        let newY = nearest(startPoint.y - dragHandle.y, 10)-5;
        console.log("mouseup, cmps id vs draghandle id ", newX, newY);
        motors.forEach(m => {
            if (dragHandle != m && m.x == dragHandle.x && m.y == dragHandle.y) {
                newX += 10; 
                newY += 10;
            }

            if (m.id == dragHandle.id) {
                m.x = startPoint.x - newX;
                m.y = startPoint.y -  newY;
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
    }
}






function drawSliders(components) {
    var slider = `<div class="d-flex justify-content-center my-8">
                             <span class="font-weight-bold indigo-text mr-2 mt-1">0</span>
                             <form class="range-field w-25">
                                 <input class="border-0" type="range" min="0" max="100" />
                             </form>
                             <span class="font-weight-bold indigo-text ml-2 mt-1">100</span>
                         </div>`;

    var maxSpeed = document.getElementById("maxSpeed");
    var minSpeed = document.getElementById("minSpeed");
    var sliders = [];
    components.forEach(component => {
        if (component.name == "Motor") {
            sliders.push(slider);
        }
    });


    maxSpeed.innerHTML = sliders;
    minSpeed.innerHTML = sliders;
}




        function closeSettings() {
            document.getElementById("myEntitySettings").style.width = "0";
            document.getElementById("createEntityMenu").style.marginRight = "60px";

            //document.getElementById("sensorRange").remove("input");
            // $("#").remove("input");
            
        }     

		function openNav() {
			closeSettings();
            document.getElementById("mySidenav").style.width = "256px";		

        }

        function closeNav() {
            document.getElementById("mySidenav").style.width = "0";
        }

        // funktioniert nicht in index.ts
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


$('.switch-btn').click(function(){
    $(this).toggleClass('switch-on');
    if ($(this).hasClass('switch-on')) {
        $(this).trigger('on.switch');
        console.log("включили");
    } else {
        $(this).trigger('off.switch');
        console.log("выключили");
    }
});

