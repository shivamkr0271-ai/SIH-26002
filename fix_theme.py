import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    replacements = {
        r'(?<!dark:)bg-\[\#0a0c14\]': 'bg-gray-50 dark:bg-[#0a0c14]',
        r'(?<!dark:)bg-\[\#05070a\]': 'bg-white dark:bg-[#05070a]',
        r'(?<!dark:)text-white': 'text-gray-900 dark:text-white',
        r'(?<!dark:)text-gray-200': 'text-gray-800 dark:text-gray-200',
        r'(?<!dark:)text-gray-300': 'text-gray-700 dark:text-gray-300',
        r'(?<!dark:)text-gray-400': 'text-gray-600 dark:text-gray-400',
        r'(?<!dark:)border-white/5': 'border-gray-200 dark:border-white/5',
        r'(?<!dark:)border-white/10': 'border-gray-300 dark:border-white/10',
        r'(?<!dark:)hover:bg-white/5': 'hover:bg-gray-200 dark:hover:bg-white/5',
        r'(?<!dark:)hover:bg-white/10': 'hover:bg-gray-300 dark:hover:bg-white/10',
        r'(?<!dark:)bg-white/5': 'bg-gray-100 dark:bg-white/5',
        r'(?<!dark:)bg-white/10': 'bg-gray-200 dark:bg-white/10'
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

