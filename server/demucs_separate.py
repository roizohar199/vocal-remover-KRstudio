#!/usr/bin/env python3
"""
Audio separation script using Demucs
Separates audio into 5 stems: vocals, drums, bass, guitar, other
"""

import sys
import subprocess
import os

def separate_audio(input_path, output_dir, mp3=True, mp3_bitrate="320"):
    """
    Separate audio using Demucs into 4 stems (vocals, drums, bass, other)
    The 'other' stem will contain guitar and other instruments
    """
    try:
        # Find demucs executable - try different paths
        demucs_paths = [
            "/usr/local/bin/demucs",
            "/usr/bin/demucs", 
            "demucs",  # if it's in PATH
            "/app/.local/bin/demucs"
        ]
        
        demucs_path = None
        for path in demucs_paths:
            try:
                result = subprocess.run([path, "--help"], capture_output=True, text=True)
                if result.returncode == 0:
                    demucs_path = path
                    break
            except:
                continue
        
        if not demucs_path:
            # Try to find demucs in PATH
            try:
                result = subprocess.run(["which", "demucs"], capture_output=True, text=True)
                if result.returncode == 0:
                    demucs_path = result.stdout.strip()
            except:
                pass
        
        if not demucs_path:
            print("Error: demucs not found. Please ensure demucs is installed.")
            return False
        
        # Build the demucs command for 4-stem separation
        cmd = [demucs_path]
        
        # Use default 4-stem separation (vocals, drums, bass, other)
        # No additional arguments needed - this is the default behavior
        
        if mp3:
            cmd.extend(["--mp3", "--mp3-bitrate", mp3_bitrate])
        
        cmd.extend([input_path, "-o", output_dir])
        
        print(f"Running command: {' '.join(cmd)}")
        
        # Run demucs with real-time output
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Read output in real-time
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
        
        # Wait for process to complete
        return_code = process.poll()
        
        if return_code != 0:
            print(f"Demucs process exited with code: {return_code}")
            return False
            
        print("Demucs completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error running Demucs: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python demucs_separate.py <input_file> <output_dir>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    success = separate_audio(input_file, output_dir)
    if not success:
        sys.exit(1) 