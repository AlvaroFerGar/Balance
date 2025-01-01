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
    const domainRadius = 200;
    const numberOfBalls = 20;

    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(mouseAuraRadius, numberOfBalls, domainRadius);

    // Crear el círculo y dominio en Paper.js
    const mouseAura = new paper.Path.Circle(paper.view.center, mouseAuraRadius);
    mouseAura.strokeWidth = 0;
    mouseAura.strokeColor = 'black';

    //Domain
    const domain = new paper.Path.Rectangle({
        center: paper.view.center,
        size: domainRadius * 2
    });
    domain.strokeWidth = 15;
    domain.strokeColor = 'black';

    //Crea el domain manager
    const domainEngine = new DomainEngine(domain, physicsEngine);

    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < numberOfBalls; i++) {
        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), 15);
        paperBall.strokeWidth = 6;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.1, 0.1, 0.1);
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

    function updateKnob() {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = (rotationDegree - 90) * (Math.PI / 180);
        const radius = rect.width / 2 - 10;

        const x = Math.cos(angle) * radius + rect.width / 2;
        const y = Math.sin(angle) * radius + rect.height / 2;

        innerCircle.style.left = x + 'px';
        innerCircle.style.top = y + 'px';
        
        let value=rotationDegree;
        if (rotationDegree < 0){
            value = 360 + rotationDegree;
        }
        valueDisplay.textContent = value;
    }

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        rotationDegree += e.deltaY > 0 ? 1 : -1;
        updateKnob();
    });

    container.addEventListener('mouseenter', () => {
        console.log("enter");
        scrollMsg.style.visibility = 'visible';
        scrollMsg.style.opacity = '1';
    });
    
    container.addEventListener('mouseleave', () => {
        console.log("leave");
        scrollMsg.style.visibility = 'hidden';
        scrollMsg.style.opacity = '0';
    });

    // Initial position
    updateKnob();

    // Función de animación
    paper.view.onFrame = function (event) {
        domain.rotate(rotationDegree - oldRotationDegree, domain.bounds.center);
        oldRotationDegree = rotationDegree;
        physicsEngine.update(mousePos, event.delta);
        domainEngine.handleCollisions(paperBalls);
        ballCounter.update(physicsEngine.balls, window.innerWidth / 2);

        rightText.position.x = window.innerWidth * (1 - percentmargin);
        leftText.position.x = window.innerWidth * percentmargin;
    };
};

let oldRotationDegree = 0;

const innerCircle = document.querySelector('.inner-circle');
const valueDisplay = document.querySelector('.value');
const container = document.querySelector('.knob-container');
const scrollMsg = document.querySelector('.scroll_msg');
let isDragging = false;

const rect = container.getBoundingClientRect();
const angle = 0-Math.PI/2;
const degrees = 0;
const radius = rect.width / 2-10;

const x = Math.cos(angle) * radius + rect.width / 2;
const y = Math.sin(angle) * radius + rect.height / 2;

innerCircle.style.left = x + 'px';
innerCircle.style.top = y + 'px';

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
