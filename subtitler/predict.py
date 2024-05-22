# Prediction interface for Cog ⚙️
# https://github.com/replicate/cog/blob/main/docs/python.md
# cog push r8.im/razvandrl/subtitler 
                                                       
import os
os.environ['HF_HOME'] = '/src/hf_models'
os.environ['TORCH_HOME'] = '/src/torch_models'
from cog import BasePredictor, Input, Path
import torch
import whisperx
import json
import subprocess
import time
import requests

compute_type="float16"

class Predictor(BasePredictor):
    def setup(self):
        """Load the model into memory to make running multiple predictions efficient"""
        self.device = "cuda"
        self.model = whisperx.load_model("large-v3", self.device, language="en", compute_type=compute_type)
        self.alignment_model, self.metadata = whisperx.load_align_model(language_code="en", device=self.device)

    def predict(
        self,
        file: Path = Input(description="File"),
        batch_size: int = Input(description="Parallelization of input audio transcription", default=32),
    ) -> str:
        """Run a single prediction on the model"""
        with torch.inference_mode():
            start_time = time.time()
            convertAudio = [
                'ffmpeg',
                '-i', str(file),
                '-vn',
                '-acodec', 'pcm_s16le',
                '-ar', '44100',
                '-ac', '2',
                f"{str(file)}.wav"
            ]
            subprocess.run(convertAudio, check=True)
            end_time = time.time()

            elapsed_time = end_time - start_time
            print(f"Subprocess took {elapsed_time:.2f} seconds to run.")
            
            result = self.model.transcribe(str(f"{file}.wav"), batch_size=batch_size) 
            result = whisperx.align(result['segments'], self.alignment_model, self.metadata, str(f"{file}.wav"), self.device, return_char_alignments=False)
        json_file_path = f"{str(file)}.json"
        with open(json_file_path, 'w') as f:
            json.dump(result['segments'], f)

        with open(json_file_path, 'rb') as f:
            response = requests.put("https://longtoshort.tech/api/upload"+"?key="+json_file_path, files={"file": f})

        if response.status_code == 200:
            print("File uploaded successfully.")
        else:
            print(f"Failed to upload file. Status code: {response.status_code}")

        raise ValueError("ca00fccfb408989eddc401062c4d1219a6aceb6b9b55412357f1790862e8f178")