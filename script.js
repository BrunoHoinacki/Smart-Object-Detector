// Elementos HTML
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const loader = document.getElementById('loader');
const loadingMessage = document.getElementById('loadingMessage');

// Verifica se o navegador suporta o acesso à webcam
function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Habilita o botão de webcam se a webcam for suportada
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() não é suportado pelo seu navegador');
}

// Função para habilitar a webcam e iniciar a classificação
function enableCam(event) {
    if (!model) return;

    // Esconde o botão após o clique
    event.target.classList.add('hidden');

    // Parâmetros para getUserMedia para forçar vídeo sem áudio
    const constraints = { video: true };

    // Ativa o fluxo de vídeo da webcam
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });
}

// Variáveis de controle
let model = undefined; // Modelo será carregado aqui
const children = [];

// Carrega o modelo COCO-SSD
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    demosSection.classList.remove('hidden');
    loader.classList.add('hidden'); // Esconde o loader quando o modelo estiver carregado
    loadingMessage.classList.add('hidden'); // Esconde a mensagem de carregamento quando o modelo estiver carregado
});

// Função que faz a previsão e desenha na tela
function predictWebcam() {
    model.detect(video).then(function (predictions) {
        children.forEach(child => liveView.removeChild(child));
        children.length = 0;

        predictions.forEach(prediction => {
            if (prediction.score > 0.66) {
                const p = document.createElement('p');
                p.innerText = `${prediction.class} - com ${Math.round(prediction.score * 100)}% de confiança.`;
                p.className = 'absolute bg-blue-800 text-white text-sm p-2 rounded-lg shadow-md';
                p.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1] - 10}px; width: ${prediction.bbox[2] - 10}px;`;

                const highlighter = document.createElement('div');
                highlighter.className = 'absolute border-2 border-white rounded-lg';
                highlighter.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2]}px; height: ${prediction.bbox[3]}px;`;

                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter, p);
            }
        });

        window.requestAnimationFrame(predictWebcam);
    });
}
