function resetLevels() {
    localStorage.removeItem('gameData');
    const howToPlayButton = document.getElementById('how-to-play-button');
    if (howToPlayButton.textContent === 'select level') {
        return;
    }

    const buttons = document.querySelectorAll('#level-select button');

    // Fade out
    buttons.forEach(button => {
        button.classList.remove('fade-in', 'fade-out'); // Elimina ambas clases
        button.classList.add('fade-out');
    });
    

    // Fade in después de 2 segundos
    setTimeout(() => {
        console.log("voy a actualizar los buttons")
        updateButtonLabels();
        const buttons = document.querySelectorAll('#level-select button');
        buttons.forEach(button => {
            button.classList.remove('fade-in', 'fade-out'); // Elimina ambas clases
            button.classList.add('fade-in');
        });
    }, 500);
}

function showHowToPlay() {
    const howToPlayButton = document.getElementById('how-to-play-button');
    const buttons = document.querySelectorAll('#level-select button');
    const center_text = document.getElementById('center-text');

    center_text.classList.remove('fade-in', 'fade-out'); // Elimina ambas clases

    if (howToPlayButton.textContent === 'how to play') {
        howToPlayButton.textContent = 'select level';
        buttons.forEach(button => {
            console.log("none");

            button.classList.remove('fade-in', 'fade-out'); // Elimina ambas clases
            button.classList.add('fade-out');
            center_text.classList.add('fade-in');
        });
    } else {
        howToPlayButton.textContent = 'how to play';
        buttons.forEach(button => {
            console.log("no none");

            button.classList.remove('fade-in', 'fade-out'); // Elimina ambas clases
            button.classList.add('fade-in');
            center_text.classList.add('fade-out');
        });
    }
}

function loadLevel(level) {
    window.location.href = `level.html?level=${level}`;
}

// Function to calculate positions and animate the buttons
function animateButtons() {
    const buttons = document.querySelectorAll('#level-select button');
    const container = document.querySelector('#level-select');
    const radius = container.offsetWidth * 0.4; // Radius of the circle
    const centerX = container.offsetWidth / 2; // Center X of the container
    const centerY = container.offsetHeight / 2; // Center Y of the container
    const angleStep = 360 / buttons.length; // Angle step between buttons
    const time = Date.now() / 1000; // Current time (in seconds)
    buttons.forEach((button, index) => {
        const angle = angleStep * index + time * 1; // Angle for each button, moving over time (45 degrees per second)
        const radian = (angle * Math.PI) / 180; // Convert angle to radians

        const x = centerX + radius * Math.cos(radian) - button.offsetWidth / 2;
        const y = centerY + radius * Math.sin(radian) - button.offsetHeight / 2;

        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
    });

    // Request the next frame to continue the animation
    requestAnimationFrame(animateButtons);
}

// Call the animation function when the page loads
window.onload = function() {
    animateButtons();
    updateButtonLabels();
};

function updateButtonLabels() {
    const buttons = document.querySelectorAll('#level-select button');
    const game_end_text = document.querySelector('#game-end-text');
    const gameData = JSON.parse(localStorage.getItem('gameData')) || {};


    let game_completed = true;
    let total_time = 0;
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const level = i+1;
        const levelData = gameData[`level${level}`];

        if (levelData && levelData.freeze) {
            let time = levelData.timeToBalance;
            total_time+=time;
            if (time >= 100) {
                button.textContent = `+99.9s`;
            } else {
                if (time < 10) {
                    button.textContent  = `0${time.toFixed(2)}s`;
                } else {
                    button.textContent = `${time.toFixed(2)}s`;
                }
            }
            button.style.fontSize = '18px'; 
            button.style.color = 'lightgreen';
        } else {
            game_completed = false;
            button.textContent = level; 
            button.style.fontSize = '';
            button.style.color = '';
        }
    }

    if(game_completed)
    {
        game_end_text.textContent = `You have achieved balance in ${total_time.toFixed(2)}s.\nNow you can rest.`;
    }
    else
    {
        game_end_text.textContent="   ";
    }
}

