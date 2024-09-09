import bpy
import json

# Ottieni l'armatura selezionata
armature = bpy.context.object
if armature is None or armature.type != 'ARMATURE':
    print("Seleziona un'armatura prima di eseguire questo script.")
else:
    # Vai in Pose Mode
    bpy.ops.object.mode_set(mode='POSE')

    # Crea un dizionario per contenere i dati delle rotazioni
    bone_rotations = {}

    # Itera su tutte le ossa in Pose Mode
    for bone in armature.pose.bones:
        # Ottieni la matrice globale e calcola la rotazione Euler
        rotation_euler = bone.matrix_basis.to_euler()

        # Salva la rotazione nel dizionario
        bone_rotations[bone.name] = {
            'rotation_x': rotation_euler.x,
            'rotation_y': rotation_euler.y,
            'rotation_z': rotation_euler.z
        }

    # Specifica il percorso e il nome del file JSON
    filepath = bpy.path.abspath("//bone_rotations.json")

    # Salva i dati delle rotazioni in un file JSON
    with open(filepath, 'w') as json_file:
        json.dump(bone_rotations, json_file, indent=4)

    print(f"Rotazioni delle ossa salvate in {filepath}")
