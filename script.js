let videoElement = document.getElementById('webcam');
let canvasElement = document.getElementById('outputCanvas');
let canvasCtx = canvasElement.getContext('2d');
let resultBox = document.getElementById('handResult');
let camera;

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
    drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const isThumbsUp = thumbTip.y < indexTip.y && 
                       middleTip.y > indexTip.y && 
                       ringTip.y > indexTip.y && 
                       pinkyTip.y > indexTip.y;

    const isPeace = indexTip.y < middleTip.y &&
                    ringTip.y > middleTip.y && 
                    pinkyTip.y > middleTip.y && 
                    thumbTip.x < indexTip.x;

    const isOK = Math.abs(thumbTip.x - indexTip.x) < 0.05 && 
                 Math.abs(thumbTip.y - indexTip.y) < 0.05;

    let detected = "✋ Hand detected, but gesture unclear.";
    if (isThumbsUp) detected = "👍 Thumbs Up";
    else if (isPeace) detected = "✌️ Peace";
    else if (isOK) detected = "👌 OK";

    resultBox.innerText = detected;
  } else {
    resultBox.innerText = "No hand detected.";
  }
  canvasCtx.restore();
});

function startCamera() {
  videoElement.style.display = 'none';
  camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
  });
  camera.start();
}

function stopCamera() {
  if (camera) {
    camera.stop();
    resultBox.innerText = "Camera stopped.";
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
}

function convertToBraille() {
  const input = document.getElementById("brailleInput").value.toLowerCase();
  const brailleMap = {
    a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑",
    f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
    k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕",
    p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
    u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
    " ": " "
  };
  let output = "";
  for (let char of input) {
    output += brailleMap[char] || "?";
  }
  document.getElementById("brailleOutput").innerText = output;
}

function respondAI() {
  const input = document.getElementById("aiInput").value.toLowerCase();
  let response = "Sanad is ready to help you.";
  if (input.includes("pain")) response = "Can you describe the pain and its location?";
  else if (input.includes("medicine")) response = "Do you need information about drug names or dosage?";
  else if (input.includes("help")) response = "Sure! What do you need help with?";
  document.getElementById("aiResponse").innerText = response;
}
