FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks and init script
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make init script executable
RUN chmod +x init_model.sh

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8002

# Run the init script which will pull model and start the app
CMD ["bash", "./init_model.sh"]
