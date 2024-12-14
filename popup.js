// Speech Synthesis Section
const textInput = document.getElementById("text-input");
const voicesSelect = document.getElementById("voices");
const rateInput = document.getElementById("rate");
const speakButton = document.getElementById("speak");
const stopButton = document.getElementById("stop");

let voices = [];
const synth = window.speechSynthesis;

// Load available voices
function loadVoices() {
  voices = synth.getVoices();
  voicesSelect.innerHTML = voices
    .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
    .join("");
}

// Speak text
function speakText() {
  const text = textInput.value;
  if (text.trim() === "") return;

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices.find(voice => voice.name === voicesSelect.value);
  utterance.voice = selectedVoice;
  utterance.rate = rateInput.value;

  synth.speak(utterance);
}

// Stop speaking
function stopSpeaking() {
  synth.cancel();
}

// Event listeners for Speech Synthesis
speakButton.addEventListener("click", speakText);
stopButton.addEventListener("click", stopSpeaking);

// Populate voices when available
synth.onvoiceschanged = loadVoices;
loadVoices();

// VisionAid Settings Section
document.getElementById("textSize").addEventListener("input", () => {
  const textSize = document.getElementById("textSize").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: updateTextSize,
      args: [textSize],
    });
  });
});

document.getElementById("applySettings").addEventListener("click", () => {
  const highContrast = document.getElementById("contrast").checked;
  const darkMode = document.getElementById("darkMode").checked;
  const colorBlindMode = document.getElementById("colorBlindMode").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyOtherSettings,
      args: [highContrast, darkMode, colorBlindMode],
    });
  });
});

function updateTextSize(textSize) {
  const styleElementId = "visionAidTextSize";
  let styleElement = document.getElementById(styleElementId);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    body, body * {
      font-size: ${textSize}% !important;
      line-height: 1.5 !important;
    }
  `;
}

// Function to apply other settings (high contrast, dark mode, color blindness)
function applyOtherSettings(highContrast, darkMode, colorBlindMode) {
  const styleElementId = "visionAidStyles";
  let styleElement = document.getElementById(styleElementId);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  let css = "";

  if (highContrast) {
    css += `
      * {
        background-color: black !important;
        color: white !important;
        border-color: white !important;
      }
      a {
        color: cyan !important;
      }
    `;
  }

  if (darkMode) {
    css += `
      html {
        background-color: black;
        color: white;
      }
      body {
        filter: invert(1) hue-rotate(180deg);
      }
      img, video {
        filter: invert(1) hue-rotate(180deg);
      }
    `;
  }

  if (colorBlindMode === "deuteranopia") {
    css += `
      body {
        filter: hue-rotate(-50deg) saturate(0.8);
      }
    `;
  } else if (colorBlindMode === "protanopia") {
    css += `
      body {
        filter: hue-rotate(-50deg) brightness(0.9);
      }
    `;
  } else if (colorBlindMode === "tritanopia") {
    css += `
      body {
        filter: hue-rotate(90deg) saturate(0.5);
      }
    `;
  }

  styleElement.textContent = css;
}
