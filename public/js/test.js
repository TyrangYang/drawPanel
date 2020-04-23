var ambientLight = 0.1,
    intensity = 1,
    radius = 100,
    amb = 'rgba(0,0,0,' + (1 - ambientLight) + ')';

addLight(ctx, intensity, amb, 200, 200, 0, 200, 200, radius); // First circle
addLight(ctx, intensity, amb, 250, 270, 0, 250, 270, radius); // Second circle
addLight(ctx, intensity, amb, 50, 370, 0, 50, 370, radius, 50); // Third!

ctx.fillStyle = amb;
ctx.globalCompositeOperation = 'xor';
ctx.fillRect(0, 0, 500, 500);

function addLight(
    ctx,
    intsy,
    amb,
    xStart,
    yStart,
    rStart,
    xEnd,
    yEnd,
    rEnd,
    xOff,
    yOff
) {
    xOff = xOff || 0;
    yOff = yOff || 0;

    var g = ctx.createRadialGradient(xStart, yStart, rStart, xEnd, yEnd, rEnd);
    g.addColorStop(1, 'rgba(0,0,0,' + (1 - intsy) + ')');
    g.addColorStop(0, amb);
    ctx.fillStyle = g;
    ctx.fillRect(
        xStart - rEnd + xOff,
        yStart - rEnd + yOff,
        xEnd + rEnd,
        yEnd + rEnd
    );
}

save_btn.addEventListener('click', (e) => {
    saveCanvas();
});
