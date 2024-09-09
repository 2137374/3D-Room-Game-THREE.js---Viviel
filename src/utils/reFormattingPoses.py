import json
import os

def reformat_json_file(file_path):
    with open(file_path, 'r+') as file:
        # Read the existing content
        content = file.read().strip()
        
        # Remove single quotes at the beginning and end if present
        if content.startswith("'") and content.endswith("'"):
            content = content[1:-1]
        
        # Parse the JSON
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON in {file_path}: {str(e)}")
            return
        
        # Move the file pointer to the beginning
        file.seek(0)
        
        # Write the formatted JSON
        json.dump(data, file, indent=4)
        
        # Truncate the file to remove any leftover content
        file.truncate()

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                reformat_json_file(file_path)
                print(f"Processed: {file_path}")

# Replace 'your_directory_path' with the path to your JSON files
directory_path = 'znewposes'
process_directory(directory_path)