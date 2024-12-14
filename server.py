from flask import Flask, request, jsonify
import google.generativeai as genai
import logging

app = Flask(__name__)

# Configure GenAI API
genai.configure(api_key="AIzaSyAUHjI-5L_s0RSs8sOKugDMY1_7cvVBhHw")

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        # Log incoming request
        logging.info("Received request for summarization")
        data = request.json
        text = data.get('text', '')

        if not text:
            logging.error("No text provided in the request")
            return jsonify({'error': 'No text provided'}), 400

        # Generate summary
        logging.info("Generating summary using GenAI")
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([f"Please summarize the following text:\n\n{text}"])
        summary = response.text

        # Log and return summary
        logging.info("Summary generated successfully")
        return jsonify({'summary': summary})
    except Exception as e:
        # Log the error details
        logging.error(f"Error during summarization: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
