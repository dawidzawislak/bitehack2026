#!/bin/bash

echo "Waiting for Ollama service to be ready..."
until curl -s http://ollama:11434/api/tags > /dev/null 2>&1; do
    echo "Ollama not ready yet, waiting..."
    sleep 2
done

echo "Ollama is ready. Checking if model exists..."

# Check if model is already pulled
if curl -s http://ollama:11434/api/tags | grep -q "llama3.2:3b-instruct-fp16"; then
    echo "Model llama3.2:3b-instruct-fp16 already exists."
else
    echo "Pulling model llama3.2:3b-instruct-fp16..."
    curl -X POST http://ollama:11434/api/pull -d '{"name":"llama3.2:3b-instruct-fp16"}' &
    PULL_PID=$!
    
    # Show progress while pulling
    while kill -0 $PULL_PID 2>/dev/null; do
        echo "Model download in progress..."
        sleep 10
    done
    
    echo "Model pull completed."
fi

echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8002 --reload
