const videoElement = document.getElementById('webcam');
const buttonElement = document.getElementById('button');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

async function main() {
    await setupCamera();
    videoElement.play();

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    camera.start();
}

let knockCount = 0;
let lastKnockTime = 0;
const knockInterval = 500; // Time in milliseconds between knocks
const requiredKnocks = 3;

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const handLandmarks = results.multiHandLandmarks[0];
        checkKnockGesture(handLandmarks);
    }
}

function checkKnockGesture(landmarks) {
    const wrist = landmarks[0]; // Wrist landmark
    const x = wrist.x * videoElement.videoWidth;
    const y = wrist.y * videoElement.videoHeight;

    const buttonRect = buttonElement.getBoundingClientRect();
    if (x >= buttonRect.left && x <= buttonRect.right && y >= buttonRect.top && y <= buttonRect.bottom) {
        const currentTime = new Date().getTime();
        if (currentTime - lastKnockTime < knockInterval) {
            knockCount++;
        } else {
            knockCount = 1; // Reset count if the interval is too long
        }
        lastKnockTime = currentTime;

        if (knockCount === requiredKnocks) {
            redirectToYouTube();
        }
    }
}

function redirectToYouTube() {
    window.location.href = 'https://www.youtube.com';
}

main();
