// Variables globales
let canvas, ctx;
let velocityCanvas, velocityCtx;
let heightCanvas, heightCtx;

let altura = 130;
let masa = 1.15;
let gravedad = 9.81;
let objetoActual = 'pelota';

let isRunning = false;
let isPaused = false;
let animationId;

let tiempo = 0;
let velocidad = 0;
let alturaActual = altura;
let deltaTime = 0.05;

let velocityData = [];
let heightData = [];
let maxDataPoints = 100;

// Objetos predefinidos
const objetos = {
    pelota: { masa: 1.15, emoji: '🏀', color: '#ff6b35' },
    piedra: { masa: 2.5, emoji: '🪨', color: '#8b7355' },
    pluma: { masa: 0.05, emoji: '🪶', color: '#e0e0e0' },
    martillo: { masa: 5.0, emoji: '🔨', color: '#c0c0c0' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initControls();
    initButtons();
    initObjectSelector();
    updateDisplay();
    drawSimulation();
    drawCharts();
});

// Inicializar canvas principal
function initCanvas() {
    canvas = document.getElementById('simulationCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;
    
    velocityCanvas = document.getElementById('velocityChart');
    velocityCtx = velocityCanvas.getContext('2d');
    velocityCanvas.width = velocityCanvas.offsetWidth;
    velocityCanvas.height = 250;
    
    heightCanvas = document.getElementById('heightChart');
    heightCtx = heightCanvas.getContext('2d');
    heightCanvas.width = heightCanvas.offsetWidth;
    heightCanvas.height = 250;
}

// Inicializar controles
function initControls() {
    const alturaSlider = document.getElementById('altura');
    const masaSlider = document.getElementById('masa');
    const gravedadSlider = document.getElementById('gravedad');
    
    alturaSlider.addEventListener('input', (e) => {
        altura = parseFloat(e.target.value);
        alturaActual = altura;
        document.getElementById('alturaValue').textContent = altura + ' m';
        if (!isRunning) {
            resetSimulation();
        }
    });
    
    masaSlider.addEventListener('input', (e) => {
        masa = parseFloat(e.target.value);
        document.getElementById('masaValue').textContent = masa.toFixed(2) + ' kg';
        if (!isRunning) {
            updateDisplay();
        }
    });
    
    gravedadSlider.addEventListener('input', (e) => {
        gravedad = parseFloat(e.target.value);
        document.getElementById('gravedadValue').textContent = gravedad.toFixed(2) + ' m/s²';
        if (!isRunning) {
            updateDisplay();
        }
    });
}

// Inicializar botones
function initButtons() {
    document.getElementById('btnStart').addEventListener('click', startSimulation);
    document.getElementById('btnPause').addEventListener('click', pauseSimulation);
    document.getElementById('btnReset').addEventListener('click', resetSimulation);
}

// Inicializar selector de objetos
function initObjectSelector() {
    const buttons = document.querySelectorAll('.objeto-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            objetoActual = btn.dataset.objeto;
            masa = objetos[objetoActual].masa;
            
            document.getElementById('masa').value = masa;
            document.getElementById('masaValue').textContent = masa.toFixed(2) + ' kg';
            
            if (!isRunning) {
                updateDisplay();
                drawSimulation();
            }
        });
    });
}

// Iniciar simulación
function startSimulation() {
    if (!isRunning || isPaused) {
        isRunning = true;
        isPaused = false;
        animate();
    }
}

// Pausar simulación
function pauseSimulation() {
    isPaused = true;
    cancelAnimationFrame(animationId);
}

// Reiniciar simulación
function resetSimulation() {
    isRunning = false;
    isPaused = false;
    cancelAnimationFrame(animationId);
    
    tiempo = 0;
    velocidad = 0;
    alturaActual = altura;
    velocityData = [];
    heightData = [];
    
    updateDisplay();
    drawSimulation();
    drawCharts();
}

// Animación principal
function animate() {
    if (!isRunning || isPaused) return;
    
    // Calcular física
    tiempo += deltaTime;
    velocidad = gravedad * tiempo;
    alturaActual = altura - (0.5 * gravedad * tiempo * tiempo);
    
    // Verificar si llegó al suelo
    if (alturaActual <= 0) {
        alturaActual = 0;
        velocidad = Math.sqrt(2 * gravedad * altura);
        isRunning = false;
    }
    
    // Guardar datos para gráficas
    velocityData.push({ t: tiempo, v: velocidad });
    heightData.push({ t: tiempo, h: alturaActual });
    
    if (velocityData.length > maxDataPoints) {
        velocityData.shift();
        heightData.shift();
    }
    
    // Actualizar display
    updateDisplay();
    drawSimulation();
    drawCharts();
    
    if (isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

// Actualizar display de datos
function updateDisplay() {
    document.getElementById('tiempo').textContent = tiempo.toFixed(2) + ' s';
    document.getElementById('velocidad').textContent = velocidad.toFixed(2) + ' m/s';
    document.getElementById('alturaActual').textContent = alturaActual.toFixed(2) + ' m';
    
    const energiaCinetica = 0.5 * masa * velocidad * velocidad;
    const energiaPotencial = masa * gravedad * alturaActual;
    
    document.getElementById('energiaCinetica').textContent = energiaCinetica.toFixed(2) + ' J';
    document.getElementById('energiaPotencial').textContent = energiaPotencial.toFixed(2) + ' J';
}

// Dibujar simulación
function drawSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar escala de altura
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    const escala = (canvas.height - 100) / altura;
    
    for (let i = 0; i <= altura; i += 20) {
        const y = canvas.height - 50 - (i * escala);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 30, y);
        ctx.stroke();
        ctx.fillText(i + 'm', 5, y + 5);
    }
    
    // Dibujar línea de caída
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Calcular posición del objeto
    const y = canvas.height - 50 - (alturaActual * escala);
    
    // Dibujar objeto con efecto de brillo
    const objeto = objetos[objetoActual];
    
    // Sombra/brillo
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, y, 10,
        canvas.width / 2, y, 40
    );
    gradient.addColorStop(0, objeto.color);
    gradient.addColorStop(0.5, objeto.color + '88');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, y, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Emoji del objeto
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(objeto.emoji, canvas.width / 2, y);
    
    // Indicador de velocidad (estela)
    if (velocidad > 0) {
        const estelasCount = Math.min(5, Math.floor(velocidad / 5));
        for (let i = 1; i <= estelasCount; i++) {
            const alpha = 0.3 - (i * 0.05);
            ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
            ctx.font = `${48 - i * 5}px Arial`;
            ctx.fillText(objeto.emoji, canvas.width / 2, y - (i * 15));
        }
    }
    
    // Información de estado
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`h = ${alturaActual.toFixed(1)} m`, 50, 30);
    ctx.fillText(`v = ${velocidad.toFixed(1)} m/s`, 50, 55);
    
    // Flecha de velocidad
    if (velocidad > 0) {
        const arrowLength = Math.min(velocidad * 3, 100);
        ctx.strokeStyle = '#38ef7d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 50, y);
        ctx.lineTo(canvas.width / 2 + 50, y + arrowLength);
        ctx.stroke();
        
        // Punta de flecha
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 50, y + arrowLength);
        ctx.lineTo(canvas.width / 2 + 45, y + arrowLength - 10);
        ctx.lineTo(canvas.width / 2 + 55, y + arrowLength - 10);
        ctx.closePath();
        ctx.fillStyle = '#38ef7d';
        ctx.fill();
        
        ctx.fillStyle = '#38ef7d';
        ctx.font = '14px Arial';
        ctx.fillText('v', canvas.width / 2 + 60, y + arrowLength / 2);
    }
}

// Dibujar gráficas
function drawCharts() {
    drawVelocityChart();
    drawHeightChart();
}

function drawVelocityChart() {
    velocityCtx.clearRect(0, 0, velocityCanvas.width, velocityCanvas.height);
    
    if (velocityData.length < 2) return;
    
    const padding = 40;
    const chartWidth = velocityCanvas.width - 2 * padding;
    const chartHeight = velocityCanvas.height - 2 * padding;
    
    const maxT = Math.max(...velocityData.map(d => d.t));
    const maxV = Math.max(...velocityData.map(d => d.v));
    
    // Ejes
    velocityCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    velocityCtx.lineWidth = 2;
    velocityCtx.beginPath();
    velocityCtx.moveTo(padding, padding);
    velocityCtx.lineTo(padding, velocityCanvas.height - padding);
    velocityCtx.lineTo(velocityCanvas.width - padding, velocityCanvas.height - padding);
    velocityCtx.stroke();
    
    // Etiquetas
    velocityCtx.fillStyle = '#fff';
    velocityCtx.font = '12px Arial';
    velocityCtx.fillText('v (m/s)', 5, 20);
    velocityCtx.fillText('t (s)', velocityCanvas.width - 40, velocityCanvas.height - 5);
    
    // Línea de datos con gradiente
    const gradient = velocityCtx.createLinearGradient(0, 0, 0, velocityCanvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    velocityCtx.strokeStyle = gradient;
    velocityCtx.lineWidth = 3;
    velocityCtx.beginPath();
    
    velocityData.forEach((point, index) => {
        const x = padding + (point.t / maxT) * chartWidth;
        const y = velocityCanvas.height - padding - (point.v / maxV) * chartHeight;
        
        if (index === 0) {
            velocityCtx.moveTo(x, y);
        } else {
            velocityCtx.lineTo(x, y);
        }
    });
    
    velocityCtx.stroke();
    
    // Área bajo la curva
    velocityCtx.lineTo(velocityCanvas.width - padding, velocityCanvas.height - padding);
    velocityCtx.lineTo(padding, velocityCanvas.height - padding);
    velocityCtx.closePath();
    
    const areaGradient = velocityCtx.createLinearGradient(0, 0, 0, velocityCanvas.height);
    areaGradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    areaGradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
    velocityCtx.fillStyle = areaGradient;
    velocityCtx.fill();
}

function drawHeightChart() {
    heightCtx.clearRect(0, 0, heightCanvas.width, heightCanvas.height);
    
    if (heightData.length < 2) return;
    
    const padding = 40;
    const chartWidth = heightCanvas.width - 2 * padding;
    const chartHeight = heightCanvas.height - 2 * padding;
    
    const maxT = Math.max(...heightData.map(d => d.t));
    const maxH = altura;
    
    // Ejes
    heightCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    heightCtx.lineWidth = 2;
    heightCtx.beginPath();
    heightCtx.moveTo(padding, padding);
    heightCtx.lineTo(padding, heightCanvas.height - padding);
    heightCtx.lineTo(heightCanvas.width - padding, heightCanvas.height - padding);
    heightCtx.stroke();
    
    // Etiquetas
    heightCtx.fillStyle = '#fff';
    heightCtx.font = '12px Arial';
    heightCtx.fillText('h (m)', 5, 20);
    heightCtx.fillText('t (s)', heightCanvas.width - 40, heightCanvas.height - 5);
    
    // Línea de datos con gradiente
    const gradient = heightCtx.createLinearGradient(0, 0, 0, heightCanvas.height);
    gradient.addColorStop(0, '#38ef7d');
    gradient.addColorStop(1, '#11998e');
    
    heightCtx.strokeStyle = gradient;
    heightCtx.lineWidth = 3;
    heightCtx.beginPath();
    
    heightData.forEach((point, index) => {
        const x = padding + (point.t / maxT) * chartWidth;
        const y = heightCanvas.height - padding - (point.h / maxH) * chartHeight;
        
        if (index === 0) {
            heightCtx.moveTo(x, y);
        } else {
            heightCtx.lineTo(x, y);
        }
    });
    
    heightCtx.stroke();
    
    // Área bajo la curva
    heightCtx.lineTo(heightCanvas.width - padding, heightCanvas.height - padding);
    heightCtx.lineTo(padding, heightCanvas.height - padding);
    heightCtx.closePath();
    
    const areaGradient = heightCtx.createLinearGradient(0, 0, 0, heightCanvas.height);
    areaGradient.addColorStop(0, 'rgba(56, 239, 125, 0.3)');
    areaGradient.addColorStop(1, 'rgba(17, 153, 142, 0.1)');
    heightCtx.fillStyle = areaGradient;
    heightCtx.fill();
}

// Responsive canvas
window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    velocityCanvas.width = velocityCanvas.offsetWidth;
    heightCanvas.width = heightCanvas.offsetWidth;
    
    drawSimulation();
    drawCharts();
});















































































/* ========================================
   🎮 JAVASCRIPT - SIMULADOR DE VECTORES 🎮
   ======================================== */

// ==========================================
// SISTEMA DE PESTAÑAS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Agregar clase active al botón clickeado
            button.classList.add('active');

            // Mostrar el contenido correspondiente
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Si se abre la pestaña del simulador, inicializar/actualizar canvas
            if (tabId === 'simulador') {
                setTimeout(() => {
                    updateCanvas();
                }, 100);
            }
        });
    });

    // ==========================================
    // SIMULADOR INTERACTIVO
    // ==========================================
    
    // Referencias a elementos del DOM
    const canvas = document.getElementById('vectorCanvas');
    const ctx = canvas.getContext('2d');
    
    // Controles de Vector A
    const magASlider = document.getElementById('magA');
    const angleASlider = document.getElementById('angleA');
    const magAValue = document.getElementById('magA-value');
    const angleAValue = document.getElementById('angleA-value');
    const axValue = document.getElementById('ax-value');
    const ayValue = document.getElementById('ay-value');
    
    // Controles de Vector B
    const magBSlider = document.getElementById('magB');
    const angleBSlider = document.getElementById('angleB');
    const magBValue = document.getElementById('magB-value');
    const angleBValue = document.getElementById('angleB-value');
    const bxValue = document.getElementById('bx-value');
    const byValue = document.getElementById('by-value');
    
    // Operaciones y visualización
    const operationSelect = document.getElementById('operation');
    const resultsContent = document.getElementById('results-content');
    const showGridCheckbox = document.getElementById('showGrid');
    const showComponentsCheckbox = document.getElementById('showComponents');
    const showAnglesCheckbox = document.getElementById('showAngles');
    const resetBtn = document.getElementById('resetBtn');
    
    // Variables del simulador
    let vectorA = { mag: 5, angle: 45 };
    let vectorB = { mag: 4, angle: 135 };
    let currentOperation = 'sum';
    let showGrid = true;
    let showComponents = true;
    let showAngles = true;
    
    // Escala y centro del canvas
    const scale = 40; // pixels por unidad
    let centerX, centerY;
    
    // Event Listeners
    magASlider.addEventListener('input', updateVectorA);
    angleASlider.addEventListener('input', updateVectorA);
    magBSlider.addEventListener('input', updateVectorB);
    angleBSlider.addEventListener('input', updateVectorB);
    operationSelect.addEventListener('change', updateOperation);
    showGridCheckbox.addEventListener('change', toggleGrid);
    showComponentsCheckbox.addEventListener('change', toggleComponents);
    showAnglesCheckbox.addEventListener('change', toggleAngles);
    resetBtn.addEventListener('click', resetSimulator);
    
    // Funciones de actualización
    function updateVectorA() {
        vectorA.mag = parseFloat(magASlider.value);
        vectorA.angle = parseFloat(angleASlider.value);
        magAValue.textContent = vectorA.mag.toFixed(1);
        angleAValue.textContent = vectorA.angle + '°';
        
        const components = getComponents(vectorA.mag, vectorA.angle);
        axValue.textContent = components.x.toFixed(2);
        ayValue.textContent = components.y.toFixed(2);
        
        updateCanvas();
    }
    
    function updateVectorB() {
        vectorB.mag = parseFloat(magBSlider.value);
        vectorB.angle = parseFloat(angleBSlider.value);
        magBValue.textContent = vectorB.mag.toFixed(1);
        angleBValue.textContent = vectorB.angle + '°';
        
        const components = getComponents(vectorB.mag, vectorB.angle);
        bxValue.textContent = components.x.toFixed(2);
        byValue.textContent = components.y.toFixed(2);
        
        updateCanvas();
    }
    
    function updateOperation() {
        currentOperation = operationSelect.value;
        updateCanvas();
    }
    
    function toggleGrid() {
        showGrid = showGridCheckbox.checked;
        updateCanvas();
    }
    
    function toggleComponents() {
        showComponents = showComponentsCheckbox.checked;
        updateCanvas();
    }
    
    function toggleAngles() {
        showAngles = showAnglesCheckbox.checked;
        updateCanvas();
    }
    
    function resetSimulator() {
        magASlider.value = 5;
        angleASlider.value = 45;
        magBSlider.value = 4;
        angleBSlider.value = 135;
        operationSelect.value = 'sum';
        showGridCheckbox.checked = true;
        showComponentsCheckbox.checked = true;
        showAnglesCheckbox.checked = true;
        
        vectorA = { mag: 5, angle: 45 };
        vectorB = { mag: 4, angle: 135 };
        currentOperation = 'sum';
        showGrid = true;
        showComponents = true;
        showAngles = true;
        
        updateVectorA();
        updateVectorB();
    }
    
    // Funciones matemáticas
    function getComponents(magnitude, angleDegrees) {
        const angleRad = angleDegrees * Math.PI / 180;
        return {
            x: magnitude * Math.cos(angleRad),
            y: magnitude * Math.sin(angleRad)
        };
    }
    
    function getMagnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    
    function getAngle(x, y) {
        let angle = Math.atan2(y, x) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        return angle;
    }
    
    // Función principal de dibujo
    function updateCanvas() {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configurar centro
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        
        // Dibujar fondo
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar cuadrícula
        if (showGrid) {
            drawGrid();
        }
        
        // Dibujar ejes
        drawAxes();
        
        // Obtener componentes
        const compA = getComponents(vectorA.mag, vectorA.angle);
        const compB = getComponents(vectorB.mag, vectorB.angle);
        
        // Dibujar según la operación
        switch(currentOperation) {
            case 'sum':
                drawVectorSum(compA, compB);
                break;
            case 'subtract':
                drawVectorSubtract(compA, compB);
                break;
            case 'dot':
                drawVectorDot(compA, compB);
                break;
            case 'cross':
                drawVectorCross(compA, compB);
                break;
        }
    }
    
    // Dibujar cuadrícula
    function drawGrid() {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x < canvas.width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y < canvas.height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Dibujar ejes coordenados
    function drawAxes() {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Etiquetas
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.fillText('X', canvas.width - 20, centerY - 10);
        ctx.fillText('Y', centerX + 10, 20);
        ctx.fillText('O', centerX + 10, centerY - 10);
    }
    
    // Dibujar un vector
    function drawVector(x, y, color, label, fromX = centerX, fromY = centerY, drawComponents = true) {
        const toX = fromX + x * scale;
        const toY = fromY - y * scale; // Y invertido en canvas
        
        // Dibujar componentes si está habilitado
        if (drawComponents && showComponents) {
            // Componente X (horizontal)
            ctx.strokeStyle = color + '60';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, fromY);
            ctx.stroke();
            
            // Componente Y (vertical)
            ctx.beginPath();
            ctx.moveTo(toX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Dibujar vector principal
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Dibujar flecha
        drawArrow(fromX, fromY, toX, toY, color);
        
        // Dibujar ángulo si está habilitado
        if (showAngles) {
            const angle = Math.atan2(-(toY - fromY), toX - fromX);
            drawAngle(fromX, fromY, angle, color);
        }
        
        // Etiqueta del vector
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(label, toX + 10, toY - 10);
        
        // Magnitud
        const mag = Math.sqrt(x * x + y * y);
        ctx.font = '12px Arial';
        ctx.fillText(`|${label}| = ${mag.toFixed(2)}`, toX + 10, toY + 10);
    }
    
    // Dibujar flecha
    function drawArrow(fromX, fromY, toX, toY, color) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }
    
    // Dibujar ángulo
    function drawAngle(x, y, angle, color) {
        const radius = 30;
        ctx.strokeStyle = color + '80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, -angle, true);
        ctx.stroke();
        
        // Etiqueta del ángulo
        const labelX = x + radius * 1.5 * Math.cos(-angle / 2);
        const labelY = y + radius * 1.5 * Math.sin(-angle / 2);
        ctx.fillStyle = color;
        ctx.font = '11px Arial';
        const degrees = (angle * 180 / Math.PI).toFixed(0);
        ctx.fillText(degrees + '°', labelX, labelY);
    }
    
    // Operación: Suma de vectores
    function drawVectorSum(compA, compB) {
        // Dibujar Vector A
        drawVector(compA.x, compA.y, '#ff6b6b', 'A');
        
        // Dibujar Vector B desde el origen
        drawVector(compB.x, compB.y, '#4ecdc4', 'B');
        
        // Calcular resultante
        const resX = compA.x + compB.x;
        const resY = compA.y + compB.y;
        
        // Dibujar resultante
        drawVector(resX, resY, '#00ff88', 'R = A + B', centerX, centerY, false);
        
        // Dibujar método del paralelogramo
        ctx.strokeStyle = '#ffea0060';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        
        // Línea paralela a A desde el extremo de B
        ctx.beginPath();
        ctx.moveTo(centerX + compB.x * scale, centerY - compB.y * scale);
        ctx.lineTo(centerX + resX * scale, centerY - resY * scale);
        ctx.stroke();
        
        // Línea paralela a B desde el extremo de A
        ctx.beginPath();
        ctx.moveTo(centerX + compA.x * scale, centerY - compA.y * scale);
        ctx.lineTo(centerX + resX * scale, centerY - resY * scale);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Mostrar resultados
        const resMag = getMagnitude(resX, resY);
        const resAngle = getAngle(resX, resY);
        
        resultsContent.innerHTML = `
            <div class="result-item">
                <h5>Vector Resultante (R = A + B)</h5>
                <p><strong>Componentes:</strong></p>
                <p>Rₓ = ${resX.toFixed(2)}</p>
                <p>Rᵧ = ${resY.toFixed(2)}</p>
                <p><strong>Magnitud:</strong> |R| = ${resMag.toFixed(2)}</p>
                <p><strong>Ángulo:</strong> θ = ${resAngle.toFixed(2)}°</p>
            </div>
        `;
    }
    
    // Operación: Resta de vectores
    function drawVectorSubtract(compA, compB) {
        // Dibujar Vector A
        drawVector(compA.x, compA.y, '#ff6b6b', 'A');
        
        // Dibujar Vector B
        drawVector(compB.x, compB.y, '#4ecdc4', 'B');
        
        // Dibujar -B
        drawVector(-compB.x, -compB.y, '#ff00aa', '-B');
        
        // Calcular resultante
        const resX = compA.x - compB.x;
        const resY = compA.y - compB.y;
        
        // Dibujar resultante
        drawVector(resX, resY, '#00ff88', 'R = A - B', centerX, centerY, false);
        
        // Mostrar resultados
        const resMag = getMagnitude(resX, resY);
        const resAngle = getAngle(resX, resY);
        
        resultsContent.innerHTML = `
            <div class="result-item">
                <h5>Vector Resultante (R = A - B)</h5>
                <p><strong>Componentes:</strong></p>
                <p>Rₓ = ${resX.toFixed(2)}</p>
                <p>Rᵧ = ${resY.toFixed(2)}</p>
                <p><strong>Magnitud:</strong> |R| = ${resMag.toFixed(2)}</p>
                <p><strong>Ángulo:</strong> θ = ${resAngle.toFixed(2)}°</p>
            </div>
        `;
    }
    
    // Operación: Producto escalar
    function drawVectorDot(compA, compB) {
        // Dibujar Vector A
        drawVector(compA.x, compA.y, '#ff6b6b', 'A');
        
        // Dibujar Vector B
        drawVector(compB.x, compB.y, '#4ecdc4', 'B');
        
        // Calcular producto punto
        const dotProduct = compA.x * compB.x + compA.y * compB.y;
        
        // Calcular ángulo entre vectores
        const magA = getMagnitude(compA.x, compA.y);
        const magB = getMagnitude(compB.x, compB.y);
        const angleRad = Math.acos(dotProduct / (magA * magB));
        const angleDeg = angleRad * 180 / Math.PI;
        
        // Dibujar ángulo entre vectores
        ctx.strokeStyle = '#ffea00';
        ctx.lineWidth = 2;
        const angleArad = Math.atan2(compA.y, compA.x);
        const angleBrad = Math.atan2(compB.y, compB.x);
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, angleArad, angleBrad, compB.x * compA.y - compB.y * compA.x < 0);
        ctx.stroke();
        
        // Mostrar resultados
        let interpretation = '';
        if (dotProduct > 0) {
            interpretation = 'Ángulo agudo (< 90°)';
        } else if (dotProduct < 0) {
            interpretation = 'Ángulo obtuso (> 90°)';
        } else {
            interpretation = 'Vectores perpendiculares (90°)';
        }
        
        resultsContent.innerHTML = `
            <div class="result-item">
                <h5>Producto Escalar (A · B)</h5>
                <p><strong>Resultado:</strong> A · B = ${dotProduct.toFixed(2)}</p>
                <p><strong>Fórmula:</strong> A · B = AₓBₓ + AᵧBᵧ</p>
                <p><strong>Cálculo:</strong> (${compA.x.toFixed(2)})(${compB.x.toFixed(2)}) + (${compA.y.toFixed(2)})(${compB.y.toFixed(2)})</p>
                <p><strong>Ángulo entre vectores:</strong> θ = ${angleDeg.toFixed(2)}°</p>
                <p><strong>Interpretación:</strong> ${interpretation}</p>
            </div>
        `;
    }
    
    // Operación: Producto vectorial
    function drawVectorCross(compA, compB) {
        // Dibujar Vector A
        drawVector(compA.x, compA.y, '#ff6b6b', 'A');
        
        // Dibujar Vector B
        drawVector(compB.x, compB.y, '#4ecdc4', 'B');
        
        // Calcular producto cruz (en 2D, resultado en z)
        const crossProduct = compA.x * compB.y - compA.y * compB.x;
        
        // Calcular magnitud y ángulo
        const magA = getMagnitude(compA.x, compA.y);
        const magB = getMagnitude(compB.x, compB.y);
        const angleRad = Math.acos((compA.x * compB.x + compA.y * compB.y) / (magA * magB));
        const angleDeg = angleRad * 180 / Math.PI;
        
        // Indicar dirección (hacia adentro o hacia afuera)
        const direction = crossProduct > 0 ? '⊙ (hacia afuera)' : '⊗ (hacia adentro)';
        const directionText = crossProduct > 0 ? 'positivo (+k̂)' : 'negativo (-k̂)';
        
        // Dibujar símbolo de dirección
        ctx.fillStyle = crossProduct > 0 ? '#00ff88' : '#ff00aa';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(direction, centerX - 80, centerY + 180);
        
        // Mostrar resultados
        resultsContent.innerHTML = `
            <div class="result-item">
                <h5>Producto Vectorial (A × B)</h5>
                <p><strong>Magnitud:</strong> |A × B| = ${Math.abs(crossProduct).toFixed(2)}</p>
                <p><strong>Fórmula 2D:</strong> A × B = (AₓBᵧ - AᵧBₓ)k̂</p>
                <p><strong>Cálculo:</strong> (${compA.x.toFixed(2)})(${compB.y.toFixed(2)}) - (${compA.y.toFixed(2)})(${compB.x.toFixed(2)}) = ${crossProduct.toFixed(2)}</p>
                <p><strong>Ángulo entre vectores:</strong> θ = ${angleDeg.toFixed(2)}°</p>
                <p><strong>Dirección:</strong> ${directionText}</p>
                <p><strong>Interpretación:</strong> El vector resultante es perpendicular al plano xy</p>
            </div>
        `;
    }
    
    // Inicializar simulador
    updateVectorA();
    updateVectorB();
    updateCanvas();
    
    // ==========================================
    // CALCULADORA DE OPERACIONES
    // ==========================================
    
    const calculateBtn = document.getElementById('calculateBtn');
    const calcResults = document.getElementById('calc-results');
    
    calculateBtn.addEventListener('click', calculateAllOperations);
    
    function calculateAllOperations() {
        const ax = parseFloat(document.getElementById('calc-ax').value);
        const ay = parseFloat(document.getElementById('calc-ay').value);
        const bx = parseFloat(document.getElementById('calc-bx').value);
        const by = parseFloat(document.getElementById('calc-by').value);
        
        // Magnitudes
        const magA = Math.sqrt(ax * ax + ay * ay);
        const magB = Math.sqrt(bx * bx + by * by);
        
        // Ángulos
        const angleA = Math.atan2(ay, ax) * 180 / Math.PI;
        const angleB = Math.atan2(by, bx) * 180 / Math.PI;
        
        // Suma
        const sumX = ax + bx;
        const sumY = ay + by;
        const sumMag = Math.sqrt(sumX * sumX + sumY * sumY);
        const sumAngle = Math.atan2(sumY, sumX) * 180 / Math.PI;
        
        // Resta
        const subX = ax - bx;
        const subY = ay - by;
        const subMag = Math.sqrt(subX * subX + subY * subY);
        const subAngle = Math.atan2(subY, subX) * 180 / Math.PI;
        
        // Producto escalar
        const dotProduct = ax * bx + ay * by;
        const angleBetween = Math.acos(dotProduct / (magA * magB)) * 180 / Math.PI;
        
        // Producto vectorial
        const crossProduct = ax * by - ay * bx;
        
        // Vectores unitarios
        const unitAx = ax / magA;
        const unitAy = ay / magA;
        const unitBx = bx / magB;
        const unitBy = by / magB;
        
        calcResults.innerHTML = `
            <div class="calc-result-section">
                <h4 style="color: #ff6b6b;">📊 Vector A</h4>
                <p>Componentes: A = (${ax}, ${ay})</p>
                <p>Magnitud: |A| = ${magA.toFixed(3)}</p>
                <p>Ángulo: θ = ${angleA.toFixed(2)}°</p>
                <p>Vector unitario: û_A = (${unitAx.toFixed(3)}, ${unitAy.toFixed(3)})</p>
            </div>
            
            <div class="calc-result-section">
                <h4 style="color: #4ecdc4;">📊 Vector B</h4>
                <p>Componentes: B = (${bx}, ${by})</p>
                <p>Magnitud: |B| = ${magB.toFixed(3)}</p>
                <p>Ángulo: θ = ${angleB.toFixed(2)}°</p>
                <p>Vector unitario: û_B = (${unitBx.toFixed(3)}, ${unitBy.toFixed(3)})</p>
            </div>
            
            <div class="calc-result-section">
                <h4 style="color: #00ff88;">➕ Suma (A + B)</h4>
                <p>Componentes: (${sumX.toFixed(3)}, ${sumY.toFixed(3)})</p>
                <p>Magnitud: ${sumMag.toFixed(3)}</p>
                <p>Ángulo: ${sumAngle.toFixed(2)}°</p>
            </div>
            
            <div class="calc-result-section">
                <h4 style="color: #ff00aa;">➖ Resta (A - B)</h4>
                <p>Componentes: (${subX.toFixed(3)}, ${subY.toFixed(3)})</p>
                <p>Magnitud: ${subMag.toFixed(3)}</p>
                <p>Ángulo: ${subAngle.toFixed(2)}°</p>
            </div>
            
            <div class="calc-result-section">
                <h4 style="color: #ffea00;">✖️ Producto Escalar (A · B)</h4>
                <p>Resultado: ${dotProduct.toFixed(3)}</p>
                <p>Ángulo entre vectores: ${angleBetween.toFixed(2)}°</p>
                <p>Interpretación: ${dotProduct > 0 ? 'Ángulo agudo' : dotProduct < 0 ? 'Ángulo obtuso' : 'Vectores perpendiculares'}</p>
            </div>
            
            <div class="calc-result-section">
                <h4 style="color: #8b5cf6;">⚡ Producto Vectorial (A × B)</h4>
                <p>Magnitud: |A × B| = ${Math.abs(crossProduct).toFixed(3)}</p>
                <p>Componente z: ${crossProduct.toFixed(3)}</p>
                <p>Dirección: ${crossProduct > 0 ? 'Positiva (+k̂)' : 'Negativa (-k̂)'}</p>
                <p>Área del paralelogramo: ${Math.abs(crossProduct).toFixed(3)}</p>
            </div>
        `;
        
        // Estilo para las secciones de resultados
        const sections = calcResults.querySelectorAll('.calc-result-section');
        sections.forEach(section => {
            section.style.background = 'rgba(139, 92, 246, 0.1)';
            section.style.padding = '1rem';
            section.style.borderRadius = '10px';
            section.style.marginBottom = '1rem';
            section.style.border = '1px solid rgba(139, 92, 246, 0.3)';
        });
    }
});