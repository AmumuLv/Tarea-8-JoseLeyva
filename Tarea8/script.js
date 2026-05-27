// Tu enlace directo a Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/eB6sddCB8/";
let model;

// 1. Cargar el modelo desde la nube
async function loadModel() {
    try {
        model = await tf.loadLayersModel(URL + 'model.json');
        const statusText = document.getElementById('status');
        
        statusText.innerText = "SISTEMA EN LÍNEA - ESPERANDO IMAGEN";
        statusText.className = "ready"; 
        
        document.getElementById('file-input').disabled = false; 
    } catch (error) {
        document.getElementById('status').innerText = "ERROR DE CONEXIÓN CON EL SERVIDOR";
        document.getElementById('status').className = "error";
        console.error("Error:", error);
    }
}

// 2. Mostrar la imagen y ejecutar la predicción
async function previewAndPredict() {
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('preview');
    const resultBox = document.getElementById('prediction-result');

    if (fileInput.files.length === 0) return;

    // Mostrar la imagen seleccionada
    const file = fileInput.files[0];
    previewImg.src = window.URL.createObjectURL(file);
    previewImg.style.display = "inline-block";
    
    // Cambiar estado a "Procesando"
    resultBox.style.display = "block";
    resultBox.innerText = "PROCESANDO MATRIZ DE PÍXELES...";
    resultBox.className = "result processing"; 

    // Esperar a que la imagen cargue
    previewImg.onload = async () => {
        // Preprocesamiento
        let imgTensor = tf.browser.fromPixels(previewImg)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims();

        // Normalización
        imgTensor = imgTensor.div(255.0);

        // Predecir
        const prediction = await model.predict(imgTensor).data();
        const classIndex = prediction.indexOf(Math.max(...prediction));
        const certeza = (Math.max(...prediction) * 100).toFixed(1);
        
        // Clases de aves
        const clases = ["Gallito de las Rocas", "Pingüino de Humboldt"];

        // Mostrar resultado final
        resultBox.innerText = `ESPECIE: ${clases[classIndex]} \n[ PRECISIÓN: ${certeza}% ]`;
        resultBox.className = "result success"; 
    };
}

// Cargar el modelo automáticamente al abrir
window.onload = loadModel;