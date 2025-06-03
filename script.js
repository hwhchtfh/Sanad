const URL = "https://teachablemachine.withgoogle.com/models/Dm1vAU2b_/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function startCamera() {
  webcam = new tmImage.Webcam(400, 300, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  document.getElementById("webcam").replaceWith(webcam.canvas);
}

function stopCamera() {
  if (webcam) {
    webcam.stop();
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  labelContainer.innerHTML = prediction[0].className + " (" + Math.round(prediction[0].probability * 100) + "%)";
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

init();
