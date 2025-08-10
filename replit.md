# Overview

This is a Flask-based AI assistant web application that provides three main functionalities: text summarization, quiz generation, and chatbot interaction. The application leverages the Groq API with LLaMA 3 70B model to deliver AI-powered text processing capabilities through an intuitive web interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Vanilla HTML/CSS/JavaScript with Bootstrap 5 for responsive design
- **Architecture Pattern**: Single Page Application (SPA) with tab-based navigation
- **UI Components**: Three main tabs (Summarizer, Quiz Generator, Chatbot) managed through Bootstrap pills
- **Theme System**: Dark/light mode toggle with CSS custom properties and localStorage persistence
- **State Management**: Session-based history tracking for each tool, managed client-side with JavaScript classes

## Backend Architecture
- **Framework**: Flask (Python) following a simple MVC pattern
- **Entry Point**: `main.py` serves as the application entry point, importing from `app.py`
- **Route Structure**: RESTful API endpoints for each AI function (`/summarize`, quiz routes, chat routes)
- **Session Management**: Flask sessions for maintaining user interaction history across tools
- **Error Handling**: Try-catch blocks with logging for API failures and graceful error responses

## AI Integration
- **Provider**: Groq API using LLaMA 3 70B 8192 model
- **Configuration**: Temperature set to 0.7 for balanced creativity, max tokens at 1024
- **Abstraction**: Centralized `ai_chat()` function handles all Groq API interactions
- **Fallback**: Error handling returns user-friendly messages when AI service fails

## Data Management
- **Session Storage**: Flask sessions store conversation history for each tool separately
- **No Persistent Database**: Application uses stateless design with session-only data retention
- **History Structure**: Organized by tool type (Summarizer, Quiz, Chatbot) in session dictionary

# External Dependencies

## AI Services
- **Groq API**: Primary AI service for text processing using LLaMA 3 70B model
- **API Key Management**: Environment variable-based configuration with fallback key

## Frontend Libraries
- **Bootstrap 5.3.0**: UI framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for enhanced visual interface

## Python Dependencies
- **Flask**: Web framework for HTTP server and routing
- **Groq**: Official Python client for Groq API integration
- **python-dotenv**: Environment variable management for configuration

## Development Tools
- **Logging**: Python's built-in logging module for debugging and error tracking
- **Environment Variables**: `.env` file support for secure configuration management