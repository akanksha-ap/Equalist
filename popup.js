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

document.addEventListener("DOMContentLoaded", () => {
  const extractTextButton = document.getElementById("extractText");
  const extractedTextArea = document.getElementById("extractedText");
  const avatarDisplay = document.getElementById("avatar");
  const signLanguageButton = document.getElementById("signLanguage");
  const signLanguageSection = document.getElementById("signLanguageSection");

  const giphyApiKey = "01iK6L85ysgGLvS1YdlMBAD1IZtXsyBC"; 

  // Show the Sign Language section when the button is clicked
  signLanguageButton.addEventListener("click", () => {
    signLanguageSection.style.display = "block"; // Show Sign Language section
  });

  // Extract highlighted text from the active tab
  extractTextButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getHighlightedText
      }, (results) => {
        const selectedText = results[0]?.result?.trim();
        if (selectedText) {
          extractedTextArea.value = selectedText;
          translateToSignLanguage(selectedText, avatarDisplay, giphyApiKey);
        } else {
          extractedTextArea.value = "No text selected. Please highlight text on the page.";
          avatarDisplay.innerHTML = "";
        }
      });
    });
  });
});

// Function to extract selected (highlighted) text
function getHighlightedText() {
  return window.getSelection().toString();
}

// Function to fetch gifs from Giphy for words
async function translateToSignLanguage(text, displayElement, apiKey) {
  displayElement.innerHTML = "<p>Translating to sign language...</p>";
  const words = text.split(/\s+/); // Split text into words

  let output = "";
  for (const word of words) {
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${word}&limit=1`);
      const data = await response.json();

      if (data.data.length > 0) {
        const gifUrl = data.data[0].images.downsized.url;
        output += `<img src="${gifUrl}" alt="${word}" title="${word}" style="margin: 5px; width: 100px; height: 100px;">`;
      } else {
        output += `<p>No gesture available for "${word}".</p>`;
      }
    } catch (error) {
      console.error(`Error fetching gif for "${word}":`, error);
      output += `<p>Error fetching gesture for "${word}".</p>`;
    }
  }

  displayElement.innerHTML = output || "<p>No gestures found.</p>";
}

document.addEventListener("DOMContentLoaded", () => {
  const extractTextForTranslateButton = document.getElementById("extractTextForTranslate");
  const extractedTextForTranslateArea = document.getElementById("extractedTextForTranslate");
  const translatedTextDisplay = document.getElementById("translatedText");
  const multilingualSection = document.getElementById("multilingualSection");

  // Show the Multilingual section when the button is clicked
  document.getElementById("multilingual").addEventListener("click", () => {
    multilingualSection.style.display = "block"; // Show Multilingual section
  });

  // Extract highlighted text and translate when the button is clicked
  extractTextForTranslateButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getHighlightedText
      }, (results) => {
        const selectedText = results[0]?.result?.trim();
        if (selectedText) {
          extractedTextForTranslateArea.value = selectedText;
          const targetLanguage = document.getElementById("targetLanguage").value;
          translateText(selectedText, targetLanguage, translatedTextDisplay);
        } else {
          extractedTextForTranslateArea.value = "No text selected. Please highlight text on the page.";
          translatedTextDisplay.innerHTML = "";
        }
      });
    });
  });
});

// Function to extract selected (highlighted) text
function getHighlightedText() {
  return window.getSelection().toString();
}

// Function to fetch translation from Google Translate API
async function translateText(text, targetLanguage, displayElement) {
  const apiKey = "AIzaSyD3ImkwjILtcgKhhdLgNBoSY6uO4QSN-Kc";  // Replace with your actual Google API key
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage
      })
    });

    const data = await response.json();
    if (data.error) {
      displayElement.innerHTML = `Error: ${data.error.message}`;
    } else {
      displayElement.innerHTML = `<p><strong>Translated Text:</strong> ${data.data.translations[0].translatedText}</p>`;
    }
  } catch (error) {
    console.error("Error during translation:", error);
    displayElement.innerHTML = "Error translating text.";
  }
}
