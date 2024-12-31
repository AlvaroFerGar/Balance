//Based on: https://github.com/zalo/zalo.github.io/blob/master/assets/js/Constraints/VerletCollision.js#L39
window.onload = function() {
    // Inicializa el canvas con Paper.js
    paper.setup('myCanvas');
    
    // Ajustar el tamaño del canvas al tamaño de la ventana
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parámetros de la simulación
    const mouseAuraRadius = 50;
    const domainRadius = 300;
    const num = 30;

    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(mouseAuraRadius, num, domainRadius);

    // Crear el círculo y dominio en Paper.js
    const mouseAura = new paper.Path.Circle(paper.view.center, mouseAuraRadius);
    mouseAura.strokeWidth = 0;
    mouseAura.strokeColor = 'black';

    const domain = new paper.Path.Circle(paper.view.center, domainRadius);
    domain.strokeWidth = 15;
    domain.strokeColor = 'black';

    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < num; i++) {
        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), 15);
        paperBall.strokeWidth = 6;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.1, 0.1, 0.1);
        paperBalls.push(paperBall);
    }

    // Manejar el redimensionamiento de la ventana
    window.onresize = function() {
        // Actualizar tamaño del canvas
        onWindowResize(canvas, domain, physicsEngine);
    };

    // Guardar la posición del mouse
    let mousePos = { x: 0, y: 0 };
    paper.view.onMouseMove = function(event) {
        mousePos = event.point;
    };

    onWindowResize(canvas, domain, physicsEngine);

    // Función de animación
    paper.view.onFrame = function(event) {
        physicsEngine.update(mousePos, event.delta);

        // Actualizar la posición de las bolas en el canvas
        for (let i = 0; i < num; i++) {
            if (domain.contains(physicsEngine.getBalls()[i]))
                {
                    paperBalls[i].position.x = physicsEngine.getBalls()[i].x;
                    paperBalls[i].position.y = physicsEngine.getBalls()[i].y;
                }
                else
                {
                    paperBalls[i].position.x = physicsEngine.getBalls()[i].prev_x;
                    paperBalls[i].position.y = physicsEngine.getBalls()[i].prev_y;
                    physicsEngine.getBalls()[i].x=physicsEngine.balls[i].prev_x;
                    physicsEngine.getBalls()[i].y=physicsEngine.balls[i].prev_y;
                }
        }     

        for (let i = 0; i < num; i++) {
            let dist=paperBalls[i].position.getDistance(domain.getNearestPoint(paperBalls[i].position));
            if(dist<physicsEngine.getBalls()[i].radius)
            {
                physicsEngine.resolveCollision(i,domain.getNearestPoint(paperBalls[i].position));
            }
        } 

        for (let i = 0; i < num; i++) {
            if (domain.contains(physicsEngine.getBalls()[i]))
                {
                    paperBalls[i].position.x = physicsEngine.getBalls()[i].x;
                    paperBalls[i].position.y = physicsEngine.getBalls()[i].y;
                }
                else
                {
                    paperBalls[i].position.x = physicsEngine.getBalls()[i].prev_x;
                    paperBalls[i].position.y = physicsEngine.getBalls()[i].prev_y;
                    physicsEngine.getBalls()[i].x=physicsEngine.balls[i].prev_x;
                    physicsEngine.getBalls()[i].y=physicsEngine.balls[i].prev_y;
                }
        }   
    };
};


function onWindowResize(canvas, domain, physicsEngine) {
    console.log("resize");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Actualizar view de Paper.js
    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    // Actualizar posición del dominio
    domain.position = paper.view.center;

    // Actualizar el centro del dominio en el motor de física
    physicsEngine.updateDomainCenter();
}
