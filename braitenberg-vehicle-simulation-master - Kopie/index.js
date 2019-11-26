var entity = null;
        var changed = [];

        function openSettings(event) {
            closeNav();
            document.getElementById("myEntitySettings").style.width = "256px";
            document.getElementById("createEntityMenu").style.marginRight = "306px";
            // falls Eintity bereits ausgewählt, braucht amn nichts zu updaten
                     
			entity = event.detail;                  // die aufgerufene Entität
            console.log(entity);

            drawMotors(entity.components);
            drawSliders(entity.components);

            document.addEventListener("entitySelected", switchEntity);

        }

        function switchEntity(event) {
            if (entity && event.detail.id == entity.id) {
                return
            }
            closeSettings();
            console.log("switch", entity);
            openSettings(event);
        }
              
        document.addEventListener("entitySelected", openSettings);

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


        function drawMotors(components) {
            var motors = [];
            var canvas = document.getElementById("motorCanvas"),
                context = canvas.getContext("2d"),
                width = canvas.width = components[1].size.value.width +10,
                height = canvas.height = components[1].size.value.height +10,
                startPoint = { "x": canvas.width / 2, "y": canvas.height / 2 },
                color = ["#00ffff", "#00ff00", "#ff00ff", "#cecece"],
                offset = {},
                isDragging = false,
                dragHandle = null;
            var i = 0;

            components.forEach(component => {
                if (component.name == "Motor") {
                  let motor = {
                    x: startPoint.x + component.position.value.x,
                    y: startPoint.y + component.position.value.y,
                    radius: 5,
                    id: component.id,
                    color: color[i],
                    name: "Motor"
                    };
                  i++;
                  motors.push(motor);
                }
            });

            draw();

            function draw() {
              context.clearRect(0, 0, width, height);
              context.strokeRect(5, 5, width-10, height-10);

              for (var i = 0; i < motors.length; i += 1) {
                context.fillStyle = color[i];
                let motor = motors[i];
                if (isDragging && motor === dragHandle) {
                  context.shadowColor = "black";
                  context.shadowOffsetX = 4;
                  context.shadowOffsetY = 4;
                  context.shadowBlur = 8;
                  }
                  

                context.beginPath();
                context.arc(motor.x, motor.y, motor.radius, 0, Math.PI * 2, false);
                context.fill();
                context.stroke();

                context.shadowColor = null;
                context.shadowOffsetX = null;
                context.shadowOffsetY = null;
                context.shadowBlur = null;
                }
                console.log("draw", motors);

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
                    console.log("down", event.clientX);
                    draw();
                  
                }
              });

            });

            function onMouseMove(event) {
              dragHandle.x = event.clientX - offset.x;
              dragHandle.y = event.clientY - offset.y;
                console.log("move", dragHandle.x);
                draw();

            }

            function onMouseUp(event) {
              canvas.removeEventListener("mousemove", onMouseMove);
              canvas.removeEventListener("mouseup", onMouseUp);
                isDragging = false;
                console.log("up", motors[0].x , startPoint.x , dragHandle.x);
                entity.components[3].setPosition(dragHandle.x - startPoint.x, dragHandle.y - startPoint.y );
                console.log("test_set");
                draw();
              
            }

            

            function distanceXY(x0, y0, x1, y1) {
              var dx = x1 - x0,
                  dy = y1 - y0;
              return Math.sqrt(dx * dx + dy * dy);
            }

            function circlePointCollision(x, y, circle) {
              return distanceXY(x, y, circle.x, circle.y) < circle.radius;
            }

            
            

            //canvas.ondragstart = closeNav;
            
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
		
