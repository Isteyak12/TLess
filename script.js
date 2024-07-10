const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');

let model;
let isModelLoaded = false;
let isClicking = false;

// Load the handpose model
async function loadModel() {
    model = await handpose.load();
    isModelLoaded = true;
    console.log("Handpose model loaded");
}

// Setup webcam
async function setupWebcam() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            video.srcObject = stream;
            video.addEventListener('loadeddata', () => resolve(), false);
        }).catch(err => reject(err));
    });
}

// Check if a point is inside a button
function isPointInButton(x, y, button) {
    const rect = button.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Handle click events
function handleClick(x, y) {
    if (isPointInButton(x, y, button1)) {
        window.location.href = 'https://www.youtube.com/';
    }
    if (isPointInButton(x, y, button2)) {
        window.location.href = 'https://www.youtube.com/';
    }
}

// Check if the hand is showing only two fingers
function isTwoFingers(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const closedFingers = [ringTip, pinkyTip];
    const openFingers = [indexTip, middleTip];

    for (const fingerTip of closedFingers) {
        const distance = Math.sqrt(
            Math.pow(thumbTip[0] - fingerTip[0], 2) +
            Math.pow(thumbTip[1] - fingerTip[1], 2)
        );
        if (distance > 60) { // Adjust this threshold as needed
            return false;
        }
    }

    for (const fingerTip of openFingers) {
        const distance = Math.sqrt(
            Math.pow(thumbTip[0] - fingerTip[0], 2) +
            Math.pow(thumbTip[1] - fingerTip[1], 2)
        );
        if (distance < 60) { // Adjust this threshold as needed
            return false;
        }
    }

    return true;
}

// Detect hands and handle clicks
async function detectHands() {
    if (isModelLoaded) {
        const predictions = await model.estimateHands(video, true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;

            // Draw keypoints
            for (let i = 0; i < landmarks.length; i++) {
                const [x, y] = landmarks[i];
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }

            // Check for two-finger gesture
            if (isTwoFingers(landmarks) && !isClicking) {
                isClicking = true;
                const indexTip = landmarks[8];
                handleClick(indexTip[0], indexTip[1]);
            } else if (!isTwoFingers(landmarks)) {
                isClicking = false;
            }
        }
    }
    requestAnimationFrame(detectHands);
}

async function main() {
    await setupWebcam();
    await loadModel();
    detectHands();
}

main();
