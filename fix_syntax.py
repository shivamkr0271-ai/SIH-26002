import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    replacements = {
        r'dark:hover:bg-gray-100 dark:bg-white/5': 'dark:hover:bg-white/5',
        r'dark:hover:bg-gray-200 dark:bg-white/10': 'dark:hover:bg-white/10',
        r'dark:border-gray-200 dark:border-white/5': 'dark:border-white/5',
        r'dark:border-gray-300 dark:border-white/10': 'dark:border-white/10'
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = new_content.replace(pattern, repl)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

