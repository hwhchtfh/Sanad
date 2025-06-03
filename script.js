const URL = "https://teachablemachine.withgoogle.com/models/Dm1vAU2b_/";

let model, webcam, labelContainer, maxPredictions;
let isCameraRunning = false;

async function initModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "Model loaded. Ready to detect.";
  } catch (err) {
    document.getElementById("error-message").innerText = "Error loading model.";
    console.error(err);
  }
}

async function startCamera() {
  if (isCameraRunning) return;

  try {
    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup();
    await webcam.play();
    isCameraRunning = true;

    const camContainer = document.getElementById("camera-container");
    camContainer.innerHTML = '';
    camContainer.appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);
  } catch (err) {
    document.getElementById("error-message").innerText = "Failed to access camera.";
    console.error(err);
  }
}

function stopCamera() {
  if (webcam && isCameraRunning) {
    webcam.stop();
    isCameraRunning = false;
    document.getElementById("camera-container").innerHTML =
      '<video id="webcam" autoplay playsinline width="400" height="300" style="display: none;"></video>';
    document.getElementById("label-container").innerText = "Camera stopped.";
  }
}

async function loop() {
  if (!isCameraRunning) return;
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  const result = prediction[0];
  document.getElementById("label-container").innerText = `${result.className} (${Math.round(result.probability * 100)}%)`;
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

initModel();
