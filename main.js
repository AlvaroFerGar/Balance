// Based on: https://github.com/zalo/zalo.github.io/blob/master/assets/js/Constraints/VerletCollision.js#L39
window.onload = function () {
    // Inicializa el canvas con Paper.js
    paper.setup('myCanvas');


    const startTime = Date.now();

    // Ajustar el tamaño del canvas al tamaño de la ventana
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parámetros de la simulación
    const mouseAuraRadius = 100;
    const numberOfBalls = 10;
    const ballRadius = 15;
    const domainRadius = 200;

    // Crear el círculo del mouse en Paper.js
    const mouseAura = new paper.Path.Circle(paper.view.center, mouseAuraRadius);
    mouseAura.strokeWidth = 0;
    mouseAura.strokeColor = 'black';

    
    // Crear un CompoundPath para el dominio
    let domain = new paper.CompoundPath();

    // Verifica si existe la función `setupDomain` para personalizar el dominio
    if (typeof setupDomain === 'function') {
        setupDomain(domain, domainRadius); // Función definida en el script del nivel
    } else {
        console.error('No se ha definido la función setupDomain para este nivel.');
    }

    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(mouseAuraRadius, numberOfBalls, domain.bounds.width / 2, ballRadius, domain);

    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < numberOfBalls; i++) {
        const position = new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y);
        let paperBall = new paper.Path.Circle(paper.view.center.add(position), ballRadius);
        paperBall.strokeWidth = 5;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.01, 0.01, 0.01);
        paperBalls.push(paperBall);
    }

    const centerX = window.innerWidth / 2;

    // Crear la línea central
    const centerLine = new paper.Path.Line({
        from: [centerX, 0],
        to: [centerX, window.innerHeight],
        strokeColor: 'gray',
        strokeWidth: 1
    });

    // Tamaño y posición del texto
    let text_size = 48;
    let text_y = text_size;
    let percentmargin = 0.1;

    // Crear textos de contador
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

    // Crear texto "back" con funcionalidad
    const backTextXcorrection = 2.7;
    const backText = new paper.PointText({
        point: [window.innerWidth / 2 - backTextXcorrection, text_y],
        content: 'back',
        fillColor: 'black',
        fontSize: text_size,
        fontStyle: 'italic',
        justification: 'center',
    });

    // Agregar evento de clic al texto
    backText.onClick = function () {
        window.location.href = 'index.html'; // Volver a la página principal
    };

    const ballCounter = new BallCounter(leftText, rightText);

    // Manejar el redimensionamiento de la ventana
    window.onresize = function () {
        onWindowResize(canvas, domain, physicsEngine, paperBalls, freeze);

        const centerX = window.innerWidth / 2;
        centerLine.firstSegment.point = new paper.Point(centerX, 0);
        centerLine.lastSegment.point = new paper.Point(centerX, window.innerHeight);
        backText.point = new paper.Point(window.innerWidth / 2 - backTextXcorrection, text_y);
    };

    // Guardar la posición del mouse
    let mousePos = { x: 0, y: 0 };
    paper.view.onMouseMove = function (event) {
        mousePos = event.point;
    };
    let freeze = false
    onWindowResize(canvas, domain, physicsEngine, paperBalls, freeze);

    let rotationDegree = 0;
    const rotationKnob = new RotationKnob(document.querySelector('.knob-container'), (value) => { rotationDegree = value; });

    ;
    const balanceLogic = new BalanceLogic();


    // Al cargar el nivel:
    const savedData = loadLevelData(loadLevelName());
    if (savedData) {
        console.log('Datos recuperados:', savedData);

        for (let i = 0; i < numberOfBalls; i++) {
                const x=savedData.ballPositions[i].x;
                const y=savedData.ballPositions[i].y;
                
                paperBalls[i].position.x = x
                paperBalls[i].position.y = y;
            }
        //physicsEngine.loadPositions(savedData.ballPositions);
        // Si quieres usar estos datos para reiniciar el nivel:
        freeze = savedData.freeze;

        rotationDegree = savedData.rotationDegree;
    }

    // Función de animación
    paper.view.onFrame = function (event) {
        domain.rotate(rotationDegree - oldRotationDegree, domain.bounds.center);
        oldRotationDegree = rotationDegree;


        const wasFrozen = freeze;
        freeze = balanceLogic.update(ballCounter, freeze);
        rotationKnob.freeze = freeze;
        rotationKnob.setBalanceMsg(freeze);

        if (!wasFrozen && freeze) {

            const gameData = {
                freeze: false,
                ballPositions: [],
                timeToBalance: null,
                rotationDegree: rotationDegree,
            };

            // El sistema acaba de alcanzar el equilibrio
            gameData.freeze = true;
            gameData.timeToBalance = (Date.now() - startTime) / 1000; // Tiempo en segundos

            // Capturar posiciones de las bolas
            gameData.ballPositions = physicsEngine.getBalls().map(ball => ({
                x: ball.x,
                y: ball.y,
            }));

            gameData.rotationDegree = rotationDegree;

            saveLevelData(loadLevelName(), gameData);
            console.log('Datos guardados:', gameData);
        }


        if (!freeze) {
            physicsEngine.update(mousePos, domain, paperBalls);
            ballCounter.update(physicsEngine.balls, window.innerWidth / 2);
        }

        rightText.position.x = window.innerWidth * (1 - percentmargin);
        leftText.position.x = window.innerWidth * percentmargin;
    };
};

let oldRotationDegree = 0;

function onWindowResize(canvas, domain, physicsEngine, paperBalls, freeze) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Actualizar view de Paper.js
    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    // Actualizar posición del dominio
    let old_domain_position = domain.position;
    domain.position = paper.view.center;

    // Actualizar el centro del dominio en el motor de física
    if (!freeze) {
        physicsEngine.updateDomainCenter();
    } else {
        for (let i = 0; i < paperBalls.length; i++) {
            paperBalls[i].position.x += (old_domain_position.x - domain.position.x);
            paperBalls[i].position.y += (old_domain_position.y - domain.position.y);
        }
    }
}

function saveLevelData(level, data) {
    const gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    gameData[level] = data;
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

function loadLevelData(level) {
    const gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    return gameData[level] || null;
}

