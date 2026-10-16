#!/usr/bin/env python3
"""Verify package, release version, signing certificate and update compatibility."""
import argparse
import hashlib
import json
import os
import pathlib
import re
import subprocess
import zipfile
from release_config import APPLICATION_ID, PROJECT, load_version
from signing import expected_certificate


def build_tools(sdk):
    folder = pathlib.Path(sdk) / 'build-tools' / '35.0.0'
    if not (folder / 'aapt2').is_file():
        raise ValueError('Install the official Android build-tools 35.0.0')
    return folder


def metadata(apk, tools):
    output = subprocess.check_output([str(tools / 'aapt2'), 'dump', 'badging', str(apk)], text=True)
    match = re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", output)
    if not match:
        raise ValueError('Cannot read APK package metadata')
    return {'application_id': match[1], 'version_code': int(match[2]), 'version_name': match[3]}


def verify(apk, sdk, unsigned=False, previous=None, require_newer=False):
    apk = pathlib.Path(apk)
    tools = build_tools(sdk)
    result = metadata(apk, tools)
    if result['application_id'] != APPLICATION_ID:
        raise ValueError('APK applicationId changed; this would be a different installation')
    version = load_version()
    if any(result[field] != version[field] for field in ('version_code', 'version_name')):
        raise ValueError('APK version does not match android/release.json')
    manifest = subprocess.check_output([str(tools / 'aapt2'), 'dump', 'xmltree', str(apk), '--file', 'AndroidManifest.xml'], text=True)
    if re.search(r'android:debuggable[^\n]*=true', manifest):
        raise ValueError('Debug APK cannot be distributed')
    with zipfile.ZipFile(apk) as archive:
        for name in archive.namelist():
            if name.lower().endswith(('.p12', '.jks', '.keystore', '.key', '.pem', '-privada.zip', '-privadas.zip')) or pathlib.PurePosixPath(name).name in ('password.txt', 'ANDROID_KEYSTORE_BASE64.txt', 'ANDROID_KEYSTORE_PASSWORD.txt'):
                raise ValueError('Private signing file found inside APK')
    if not unsigned:
        certificates = subprocess.check_output([str(tools / 'apksigner'), 'verify', '--print-certs', str(apk)], text=True)
        match = re.search(r'certificate SHA-256 digest: ([0-9a-f]{64})', certificates)
        if not match or match[1] != expected_certificate():
            raise ValueError('APK signing certificate differs from the installed Protocolo Novo identity')
        result['certificate_sha256'] = match[1]
    subprocess.run([str(tools / 'zipalign'), '-c', '-p', '4', str(apk)], check=True)
    if previous:
        old = metadata(previous, tools)
        certificates = subprocess.check_output([str(tools / 'apksigner'), 'verify', '--print-certs', str(previous)], text=True)
        match = re.search(r'certificate SHA-256 digest: ([0-9a-f]{64})', certificates)
        if not match or match[1] != expected_certificate():
            raise ValueError('Previous published APK does not match the protected signing certificate')
        if old['application_id'] != result['application_id']:
            raise ValueError('Cannot update the previous APK: applicationId differs')
        if result['version_code'] < old['version_code'] or (require_newer and result['version_code'] == old['version_code']):
            raise ValueError('Increase version_code and version_name in android/release.json before publishing a new update')
    result.update(signed=not unsigned, filename=apk.name, sha256=hashlib.sha256(apk.read_bytes()).hexdigest())
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk')
    parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT', str(PROJECT.parent.parent / 'android-tools/sdk')))
    parser.add_argument('--unsigned', action='store_true')
    parser.add_argument('--previous')
    parser.add_argument('--require-newer', action='store_true')
    parser.add_argument('--output')
    args = parser.parse_args()
    try:
        result = verify(args.apk, args.sdk, args.unsigned, args.previous, args.require_newer)
        if args.output:
            pathlib.Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
        print('APK identity, version, alignment' + (', signature' if not args.unsigned else ' (unsigned CI build)') + ' verified.')
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
