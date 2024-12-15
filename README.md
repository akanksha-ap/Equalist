# Equalist - Empowering the Disabled Community

## Overview

Equalist is a Google Chrome extension designed to help disabled individuals, particularly those who are deaf and blind. This extension aims to provide equal access to educational and informational content by offering features such as text-to-speech, sign language conversion, multi-language translation, content summarization, and more. The extension uses Google API tools to provide real-time accessibility features and improve the learning experience for people with disabilities.

## Key Features

- **Text-to-Speech**: Users can highlight any text on a webpage, and the extension will read it aloud using Google Text-to-Speech API, with support for multiple accents and voices.
- **Sign Language Conversion**: Equalist converts highlighted text into real-time sign language gestures, including American Sign Language (ASL) and Indian Sign Language, to assist deaf users in understanding content.
- **Multi-language Translation**: The extension translates the highlighted text into multiple languages using Google Cloud Translation API, making content accessible for non-native speakers.
- **Content Summarization**: By using Jan AI, Equalist summarizes long or complex content, making it easier for users to grasp key points quickly.
- **User-Friendly Icons**: The extension integrates intuitive icons for easy navigation and functionality, making it accessible even for visually impaired users.

## Tools and Technologies

- **Jan AI**: Summarizes and generates content to make long texts more digestible.
- **Google Cloud Translation API**: Provides real-time multi-language translation.
- **Google Text-to-Speech API**: Reads out highlighted text with multiple accents for varied accessibility.
- **YouTube Data API V3**: Extracts captions from YouTube videos to convert into real-time sign language.
- **Generative Gemini**: Utilized for media content generation and processing.
- **MediaPipe**: Handles sign language gesture recognition using datasets.
- **YouTube Captions Dataset**: Provides captions from educational videos.
- **Sign Language Datasets**: American and Indian sign language datasets for gesture conversion.

## How It Works

1. **Text Highlighting**: Users can highlight text on any webpage.
2. **Text-to-Speech**: Once highlighted, the extension reads the text aloud.
3. **Sign Language Conversion**: The highlighted text can be converted into sign language gestures (ASL or Indian Sign Language) in real-time.
4. **Language Translation**: The user can convert the highlighted text into another language using Google Cloud Translation API.
5. **Content Summarization**: The extension can summarize long paragraphs, making it easier for users to understand key points.
6. **Customizable Icons**: Icons are designed for each feature, ensuring easy interaction for users with disabilities.

## How to Install

1. Clone the repository.
2. Load the extension in Google Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode."
   - Click "Load unpacked" and select the extension directory.
3. Highlight any text or a webpage to use the extension's features.

## Future Plans

- **Additional Sign Languages**: Expanding support to more sign languages globally.
- **Enhanced Voice Customization**: Providing a range of voices and accents for improved accessibility.
- **User Feedback Integration**: Adding a feature for users to give feedback, which will help improve the extension's functionality.

## Conclusion

Equalist is a powerful tool that enhances digital content accessibility for disabled individuals. By leveraging Google's AI and accessibility tools, Equalist ensures that deaf and blind users have equal access to the information they need, whether through speech, sign language, or translations.
