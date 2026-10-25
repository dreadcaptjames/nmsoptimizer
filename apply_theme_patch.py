#!/usr/bin/env python3
"""Patch an existing ATLAS MAX ZIP or directory without replacing other application code."""
import argparse
import pathlib
import re
import shutil
import sys
import tempfile
import zipfile

SCRIPT = 'atlas-theme-switcher.js'
INJECT = f'  <script src="{SCRIPT}" defer></script>\n'


def patch_index(path):
    source = path.read_text(encoding='utf-8')
    if re.search(r'<script\b[^>]*src\s*=\s*["\'][^"\']*atlas-theme-switcher\.js["\']', source, re.I):
        return False
    if re.search(r'</body\s*>', source, re.I):
        result = re.sub(r'</body\s*>', lambda m: INJECT + m.group(), source, count=1, flags=re.I)
    else:
        result = source + '\n' + INJECT
    path.write_text(result, encoding='utf-8')
    return True


def choose_index(root):
    indexes = [p for p in root.rglob('index.html') if not any(part.startswith('.') for part in p.relative_to(root).parts)]
    if not indexes:
        raise ValueError('No index.html found. Supply the complete ATLAS MAX website ZIP or folder.')
    # Prefer root index; otherwise use the shallowest site folder.
    indexes.sort(key=lambda p: (len(p.relative_to(root).parts), str(p)))
    return indexes[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=pathlib.Path, help='Existing website ZIP or extracted website folder')
    parser.add_argument('-o', '--output', type=pathlib.Path, default=None, help='Output ZIP path')
    args = parser.parse_args()
    if not args.source.exists():
        parser.error('Source ZIP/folder not found')
    out = args.output or args.source.parent / 'atlas-max-with-five-themes.zip'
    with tempfile.TemporaryDirectory() as temp:
        root = pathlib.Path(temp)
        if args.source.is_file():
            if not zipfile.is_zipfile(args.source):
                parser.error('Source file must be a ZIP archive')
            with zipfile.ZipFile(args.source, 'r') as archive:
                # Prevent archive paths from escaping the working directory.
                for item in archive.infolist():
                    candidate = (root / item.filename).resolve()
                    if not candidate.is_relative_to(root.resolve()):
                        raise ValueError(f'Unsafe ZIP entry: {item.filename}')
                archive.extractall(root)
        else:
            shutil.copytree(args.source, root, dirs_exist_ok=True)
        index = choose_index(root)
        patched = patch_index(index)
        shutil.copy2(pathlib.Path(__file__).with_name(SCRIPT), index.with_name(SCRIPT))
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.resolve().is_relative_to(args.source.resolve()) and args.source.is_dir():
            raise ValueError('Output ZIP must be outside the website directory')
        with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=8) as archive:
            for file in sorted(root.rglob('*')):
                if file.is_file(): archive.write(file, file.relative_to(root))
        print(f'Created: {out}')
        print(f'Patched: {index.relative_to(root)} ({"new script tag" if patched else "already linked"})')
        print('All existing site files retained.')

if __name__ == '__main__':
    try: main()
    except (ValueError, OSError, zipfile.BadZipFile) as e:
        print(f'Error: {e}', file=sys.stderr)
        sys.exit(1)
