import os
import logging
from flask import Flask, send_from_directory, request, jsonify, session
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key_for_development")

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def ai_chat(prompt):
    """Generate AI response using Groq API"""
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        return "Sorry, I encountered an error while processing your request. Please try again."


@app.route('/')
def index():
    """Main page route"""
    return send_from_directory('.', 'index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    """Handle text summarization"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Please enter some text to summarize.'}), 400
        
        # Generate summary
        prompt = f"Summarize this text in a clear and concise manner:\n\n{text}"
        summary = ai_chat(prompt)
        
        return jsonify({
            'success': True,
            'summary': summary
        })
    
    except Exception as e:
        logging.error(f"Summarization error: {str(e)}")
        return jsonify({'error': 'An error occurred while summarizing the text.'}), 500

@app.route('/api/generate_quiz', methods=['POST'])
def generate_quiz():
    """Handle quiz generation"""
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        
        if not topic:
            return jsonify({'error': 'Please enter a topic for the quiz.'}), 400
        
        # Generate quiz
        prompt = f"Generate 5 multiple-choice quiz questions with answers about {topic}. Format each question clearly with options A, B, C, D and indicate the correct answer."
        quiz = ai_chat(prompt)
        
        return jsonify({
            'success': True,
            'quiz': quiz
        })
    
    except Exception as e:
        logging.error(f"Quiz generation error: {str(e)}")
        return jsonify({'error': 'An error occurred while generating the quiz.'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chatbot interaction"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Please enter a message.'}), 400
        
        # Generate AI response
        response = ai_chat(message)
        
        return jsonify({
            'success': True,
            'response': response
        })
    
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your message.'}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'backend': True})

# Serve static files
@app.route('/<path:path>')
def serve_static_files(path):
    """Serve static files"""
    return send_from_directory('.', path)
