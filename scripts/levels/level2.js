function setupDomain(domain,domainRadius) {

    const new_radius = 300;

    const circle = new paper.Path.Circle({
        center: paper.view.center,
        radius: new_radius
    });
    domain.addChild(circle);
    domain.strokeWidth = 10;
    domain.strokeColor = 'black';

    const numLines = 10;


    let startPercentage = 0.25;
    let endPercentage = 0.8;
    // Calculamos el ángulo entre líneas basado en el número de líneas
    const angleStep = (2 * Math.PI) / numLines;
    // Add radial lines
    for (let i = 0; i < numLines; i++) {
        // Calculate angle for each line
        const angle = i * angleStep;
        
        // Calculate start and end points using percentages
        const startPoint = new paper.Point(
            paper.view.center.x + Math.cos(angle) * (new_radius * startPercentage),
            paper.view.center.y + Math.sin(angle) * (new_radius * startPercentage)
        );
        
        const endPoint = new paper.Point(
            paper.view.center.x + Math.cos(angle) * (new_radius * endPercentage),
            paper.view.center.y + Math.sin(angle) * (new_radius * endPercentage)
        );
        
        // Create the line
        const line = new paper.Path.Line({
            from: startPoint,
            to: endPoint,
            strokeColor: 'black',
            strokeWidth: 10
        });
        
        domain.addChild(line);
    }
}
function loadLevelName(){return "level2";};