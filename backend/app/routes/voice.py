"""Voice processing API."""

from fastapi import APIRouter, UploadFile, File, HTTPException
import time
import random

router = APIRouter()

@router.post("/voice/process")
async def process_voice(file: UploadFile = File(...)):
    """
    Process uploaded audio file and return transcribed text.
    Currently mocked to avoid dependency issues with speech_recognition/pydub
    on the user's local environment if not installed.
    """
    # Simulate processing delay
    time.sleep(1.5)
    
    # In a real app, we would save 'file' and pass it to Whisper or Google Speech API
    # content = await file.read()
    
    # Mock responses based on typical triage inputs
    mock_transcriptions = [
        "I have a severe headache and I've been feeling dizzy since this morning.",
        "My chest hurts when I breathe deeply, and I have a dry cough.",
        "I fell down the stairs and my right ankle is very swollen and painful.",
        "I've had a high fever for two days and I'm shivering constantly.",
        "My stomach has been hurting really bad after I ate dinner last night."
    ]
    
    return {
        "text": random.choice(mock_transcriptions),
        "confidence": round(random.uniform(0.85, 0.99), 2),
        "detected_language": "en-US"
    }
