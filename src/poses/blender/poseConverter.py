import json
import os

def find_file_case_insensitive(filename):
    for file in os.listdir('.'):
        if file.lower() == filename.lower():
            return file
    return None

def read_json_file(filename):
    with open(filename, 'r') as file:
        return json.load(file)

def write_json_file(filename, data):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=2)

def calculate_offset(blender_base, threejs_base):
    offset = {}
    for bone_name in blender_base.keys():
        if bone_name in threejs_base:
            offset[bone_name] = {
                'x': threejs_base[bone_name]['x'] - blender_base[bone_name]['rotation_x'],
                'y': threejs_base[bone_name]['y'] - blender_base[bone_name]['rotation_y'],
                'z': threejs_base[bone_name]['z'] - blender_base[bone_name]['rotation_z']
            }
    return offset

def convert_angles(blender_angles, offset):
    converted_angles = {}
    for bone_name, blender_rotation in blender_angles.items():
        if bone_name in offset:
            converted_angles[bone_name] = {
                'x': blender_rotation['rotation_x'] + offset[bone_name]['x'],
                'y': blender_rotation['rotation_y'] + offset[bone_name]['y'],
                'z': blender_rotation['rotation_z'] + offset[bone_name]['z']
            }
    return converted_angles

def convert_pose(blender_pose_file, offset):
    blender_pose = read_json_file(blender_pose_file)
    
    converted_pose = convert_angles(blender_pose, offset)
    
    output_file = blender_pose_file.replace('Blender.json', 'ThreeJS.json')
    write_json_file(output_file, converted_pose)
    print(f"Converted pose saved to {output_file}")

def process_all_files(blender_base_file, threejs_base_file):
    blender_base = read_json_file(blender_base_file)
    threejs_base = read_json_file(threejs_base_file)
    
    offset = calculate_offset(blender_base, threejs_base)

    for filename in os.listdir('.'):
        if filename.endswith('Blender.json') and filename != blender_base_file:
            print(f"Converting {filename}...")
            convert_pose(filename, offset)

if __name__ == "__main__":
    blender_base_file = 'A Pose Blender.json'
    threejs_base_file = 'A pose.json'
    
    if not os.path.exists(blender_base_file) or not os.path.exists(threejs_base_file):
        print(f"Error: Base pose files not found. Please ensure {blender_base_file} and {threejs_base_file} are in the current directory.")
    else:
        process_all_files(blender_base_file, threejs_base_file)

if __name__ == "__main__":
    print("Current working directory:", os.getcwd())
    print("Files in the current directory:")
    for file in os.listdir('.'):
        print(file)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    blender_base_file = os.path.join(script_dir, 'A Pose Blender.json')
    threejs_base_file = os.path.join(script_dir, 'A pose.json')
    
    print(f"Looking for Blender base file: {blender_base_file}")
    print(f"Looking for Three.js base file: {threejs_base_file}")
    
    if not os.path.exists(blender_base_file) or not os.path.exists(threejs_base_file):
        print(f"Error: Base pose files not found. Please ensure 'A Pose Blender.json' and 'A pose.json' are in the directory: {script_dir}")
    else:
        process_all_files(blender_base_file, threejs_base_file)


if __name__ == "__main__":
    print("Current working directory:", os.getcwd())
    print("Files in the current directory:")
    for file in os.listdir('.'):
        print(file)

    blender_base_filename = find_file_case_insensitive('A Pose Blender.json')
    threejs_base_filename = find_file_case_insensitive('A pose.json')

    if blender_base_filename and threejs_base_filename:
        blender_base_file = os.path.join(os.getcwd(), blender_base_filename)
        threejs_base_file = os.path.join(os.getcwd(), threejs_base_filename)
        
        print(f"Found Blender base file: {blender_base_file}")
        print(f"Found Three.js base file: {threejs_base_file}")
        
        process_all_files(blender_base_file, threejs_base_file)
    else:
        print("Error: Base pose files not found.")
        if not blender_base_filename:
            print("'A Pose Blender.json' is missing.")
        if not threejs_base_filename:
            print("'A pose.json' is missing.")
        print("Please ensure both files are in the current directory.")
