//Based on: https://github.com/zalo/zalo.github.io/blob/master/assets/js/Constraints/VerletCollision.js#L39
window.onload = function() {
    // Inicializa el canvas con Paper.js
    paper.setup('myCanvas');
    
    // Ajustar el tamaño del canvas al tamaño de la ventana
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parámetros de la simulación
    const mouseAuraRadius = 100;
    const domainRadius = 200;
    const numberOfBalls = 10;
    const ballRadius = 15;

    // Crear el círculo y dominio en Paper.js
    const mouseAura = new paper.Path.Circle(paper.view.center, mouseAuraRadius);
    mouseAura.strokeWidth = 0;
    mouseAura.strokeColor = 'black';

    // Crear un CompoundPath para el dominio
    let domain = new paper.CompoundPath();
        // Crear el rectángulo base y añadirlo al CompoundPath
        const domainRect = new paper.Path.Rectangle({
            center: paper.view.center,
            size: [domainRadius * 2, domainRadius * 2]
        });
        domain.addChild(domainRect);

        // Longitud de las líneas externas
        const segmentLength = 80;

        // Centros y desplazamientos para las líneas adicionales
        const centers = [
            [domainRect.bounds.center.x, domainRect.bounds.topCenter.y, 0, segmentLength], // Línea hacia arriba
            [domainRect.bounds.center.x, domainRect.bounds.bottomCenter.y, 0, -segmentLength],
            [domainRect.bounds.leftCenter.x, domainRect.bounds.center.y, segmentLength, 0],
            [domainRect.bounds.rightCenter.x, domainRect.bounds.center.y, -segmentLength,0]
        ];

        // Crear y añadir líneas al CompoundPath
        centers.forEach(([x, y, dx, dy]) => {
            const line = new paper.Path.Line({
                from: new paper.Point(x, y),
                to: new paper.Point(x + dx, y + dy)
            });
            domain.addChild(line);
        });

        // Estilo para el CompoundPath
        domain.strokeWidth = 18;
        domain.strokeColor = 'black';



    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(mouseAuraRadius, numberOfBalls, domainRadius, ballRadius, domain);




    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < numberOfBalls; i++) {
//        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), ballRadius);
        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), ballRadius);
        paperBall.strokeWidth = 5;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.01, 0.01, 0.01);
        paperBalls.push(paperBall);
    }

    const centerX = window.innerWidth / 2;

    // Create center line
    const centerLine = new paper.Path.Line({
        from: [centerX, 0],
        to: [centerX, window.innerHeight],
        strokeColor: 'gray',
        strokeWidth: 1
    });

    let text_size = 48;
    let text_y = text_size;
    let percentmargin = 0.1;

    // Create counter texts
    const leftText = new paper.PointText({
        point: [percentmargin * window.innerWidth, text_y],
        content: '0',
        fillColor: 'black',
        fontSize: text_size,
        justification: 'left'
    });

    const rightText = new paper.PointText({
        point: [(1 - percentmargin) * window.innerWidth, text_y],
        content: '0',
        fillColor: 'black',
        fontSize: text_size,
        justification: 'right'
    });
    centerLine.firstSegment.point = new paper.Point(centerX, 0);
    centerLine.lastSegment.point = new paper.Point(centerX, window.innerHeight);

    const ballCounter = new BallCounter(leftText, rightText);


    // Manejar el redimensionamiento de la ventana
    window.onresize = function() {
        console.log("resize");
        // Actualizar tamaño del canvas
        onWindowResize(canvas, domain, physicsEngine);
        // Update centerLine position
        const centerX = window.innerWidth / 2;
        centerLine.firstSegment.point = new paper.Point(centerX, 0);
        centerLine.lastSegment.point = new paper.Point(centerX, window.innerHeight);
        //rightText.position.x = window.innerWidth*(1-percentmargin);
        //leftText.position.x = window.innerWidth*percentmargin;
    };

    // Guardar la posición del mouse
    let mousePos = { x: 0, y: 0 };
    paper.view.onMouseMove = function (event) {
        mousePos = event.point;
    };

    onWindowResize(canvas, domain, physicsEngine);

    let rotationDegree = 0;

    const rotationKnob = new RotationKnob(document.querySelector('.knob-container'), (value) => {console.log(value); rotationDegree=value});

    // Función de animación
    paper.view.onFrame = function (event) {
        domain.rotate(rotationDegree - oldRotationDegree, domain.bounds.center);
        oldRotationDegree = rotationDegree;
        physicsEngine.update(mousePos,domain, paperBalls);
        ballCounter.update(physicsEngine.balls, window.innerWidth / 2);

        rightText.position.x = window.innerWidth * (1 - percentmargin);
        leftText.position.x = window.innerWidth * percentmargin;
    };
};

let oldRotationDegree = 0;

function onWindowResize(canvas, domain, physicsEngine, centerLine, rightText) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Actualizar view de Paper.js
    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    // Actualizar posición del dominio
    domain.position = paper.view.center;

    // Actualizar el centro del dominio en el motor de física
    physicsEngine.updateDomainCenter();
}
