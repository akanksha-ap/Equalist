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

  let css = ``;

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

// Speech Synthesis Section
const textInput = document.getElementById("text-input");
const voicesSelect = document.getElementById("voices");
const rateInput = document.getElementById("rate");
const speakButton = document.getElementById("speak");
const stopButton = document.getElementById("stop");
const summarizeButton = document.getElementById("summarize"); // Added summarize button
const summaryOutput = document.getElementById("summary-output"); // Added output element for summary

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

// Summarize text by calling the Python backend
async function summarizeText() {
    const text = textInput.value;
    if (text.trim() === "") {
        summaryOutput.textContent = "Please enter some text to summarize.";
        return;
    }

    try {
        console.log("Sending request to backend...");
        const response = await fetch("http://127.0.0.1:5000/summarize", { // Updated port to 5000
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error from backend:", errorData.error);
            summaryOutput.textContent = `Error: ${errorData.error}`;
            return;
        }

        const data = await response.json();
        console.log("Summary response:", data);
        summaryOutput.textContent = data.summary || "No summary available.";
    } catch (error) {
        console.error("Error summarizing text:", error);
        summaryOutput.textContent = "Network error. Please ensure the backend is running.";
    }
}

// Event listeners for Speech Synthesis
speakButton.addEventListener("click", speakText);
stopButton.addEventListener("click", stopSpeaking);

// Event listener for Summarization
summarizeButton.addEventListener("click", summarizeText);

// Populate voices when available
synth.onvoiceschanged = loadVoices;
loadVoices();
