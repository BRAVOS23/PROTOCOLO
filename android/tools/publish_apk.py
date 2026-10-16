#!/usr/bin/env python3
"""Stage a verified newer APK for the existing GitHub Pages download."""
import argparse
import os
import pathlib
import re
import shutil
import subprocess
from release_config import ARTIFACT, PROJECT
from verify_apk import verify

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('apk')
parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT', str(PROJECT.parent.parent / 'android-tools/sdk')))
args = parser.parse_args()
root = PROJECT.parent
try:
    result = verify(args.apk, args.sdk, previous=root / 'downloads' / ARTIFACT, require_newer=True)
    entry = root / 'index.html'
    content, count = re.subn(r'(/downloads/Protocolo-Novo\.apk\?v=)[^"\s]+', lambda match: match[1] + result['version_name'], entry.read_text())
    if count != 1:
        raise ValueError('Expected one Protocolo Novo download link in index.html')
    shutil.copy2(args.apk, root / 'downloads' / ARTIFACT)
    (root / 'downloads' / (ARTIFACT + '.sha256')).write_text(result['sha256'] + '  ' + ARTIFACT + '\n')
    entry.write_text(content)
    print('Verified newer APK staged in downloads/ and link updated. Review and commit these files to publish via GitHub Pages.')
except (ValueError, OSError, subprocess.CalledProcessError) as error:
    parser.exit(1, str(error) + '\n')
