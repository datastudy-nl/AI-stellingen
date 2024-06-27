
let currentIndex = 0;
let data;
const statementElement = document.getElementById('statement');
const currentCard = document.getElementById('currentCard');
// const nextCard = document.getElementById('nextCard');
const container = document.querySelector('.container');

function handleStart(e) {
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    isDragging = true;
    currentCard.style.transition = 'none';
}

function handleMove(e) {
    if (!isDragging) return;
    moveX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = moveX - startX;
    const rotation = diff / 10;
    currentCard.style.transform = `translateX(${diff}px) rotateY(${rotation}deg)`;
    currentCard.style.opacity = 1;
}

function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    const diff = moveX - startX;
    if (Math.abs(diff) > 50) { // Lowered threshold for swiping
        if (diff > 0) {
            console.log("Eens met: " + data[currentIndex]);
            nextStatement(1);
        }
        if (diff < 0) {
            console.log("Oneens met: " + data[currentIndex]);
            nextStatement(-1);
        }
    } else {
        currentCard.style.transition = 'transform 0.3s ease';
        currentCard.style.transform = '';
    }
    // nextCard.style.opacity = 0;
}


function loadStatement() {
    console.log(data[currentIndex]);
    statementElement.textContent = data[currentIndex].statement;
    // nextCard.textContent = data[(currentIndex + 1) % data.length].statement;
    groupElement = document.getElementById('group');
    groupElement.textContent = data[currentIndex].group;
    cardContent = document.getElementById('cardContent');
    cardContent.style.backgroundColor = data[currentIndex].groupColor;
}

function nextStatement(direction) {
    currentCard.style.transition = 'all 0.3s ease';
    currentCard.style.transform = `translateX(${direction * 150}%) rotateY(${direction * 15}deg)`;
    currentCard.style.opacity = 0;
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % data.length;
        loadStatement();
        currentCard.style.transform = '';
        setTimeout(() => {
            currentCard.style.transition = 'all 0.1s ease';
            currentCard.style.opacity = 1;
        }, 300);
    }, 200);
}


let startX, moveX, isDragging = false;

container.addEventListener('touchstart', handleStart, { passive: true });
container.addEventListener('touchmove', handleMove, { passive: true });
container.addEventListener('touchend', handleEnd);

container.addEventListener('mousedown', handleStart);
container.addEventListener('mousemove', handleMove);
container.addEventListener('mouseup', handleEnd);
container.addEventListener('mouseleave', handleEnd);

function generateUniqueColors(baseColor, numColors) {
    // Convert base color from hex to HSL
    function hexToHsl(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return [h, s * 100, l * 100];
    }

    // Convert HSL to hex
    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
        g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
        b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    // Get base color HSL
    let [baseHue, baseSaturation, baseLightness] = hexToHsl(baseColor);

    // Generate colors
    let colors = [];
    let hueIncrement = 360 / numColors;

    for (let i = 0; i < numColors; i++) {
        let newHue = (baseHue + hueIncrement * i) % 360;
        colors.push(hslToHex(newHue, baseSaturation, baseLightness));
    }

    return colors;
}

fetch('./stellingen.json')
    .then(response => response.json())
    .then(d => {
        data = d;
        // shuffle the data
        data.sort(() => Math.random() - 0.5);

        unique_groups = [...new Set(data.map(d => d.group))];
        first_group_color = '#5b209a'
        groupColors = generateUniqueColors(first_group_color, unique_groups.length);
        unique_groups.forEach((group, i) => {
            data.forEach(d => {
                if (d.group === group) {
                    d.groupColor = groupColors[i];
                }
            });
        });
        loadStatement();
    });