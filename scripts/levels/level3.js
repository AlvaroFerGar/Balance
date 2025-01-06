function setupDomain(domain,domainRadius) {
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

}
function loadLevelName(){return "level3";};