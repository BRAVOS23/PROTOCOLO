#!/usr/bin/env python3
"""Build Protocolo with its fixed identity; unsigned mode is only for CI checks."""
import argparse
import hashlib
import os
import pathlib
import shutil
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from release_config import APPLICATION_ID, ARTIFACT, NAMESPACE, PROJECT, load_version
from signing import signing_dir, validate
from verify_apk import verify

WEB = PROJECT.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT', str(WEB.parent / 'android-tools/sdk')))
parser.add_argument('--debug', action='store_true', help='Signed WebView inspection build; never distribute.')
parser.add_argument('--unsigned', action='store_true', help='Compile without private keys for CI; cannot be installed.')
args = parser.parse_args()
if args.debug and args.unsigned:
    parser.error('--debug and --unsigned cannot be combined')
version = load_version()
source_manifest = PROJECT / 'app/src/main/AndroidManifest.xml'
if ET.parse(source_manifest).getroot().get('package') != APPLICATION_ID:
    parser.error('The Android applicationId must remain app.protocolo.personal')
if not args.unsigned:
    try:
        key, password = validate(signing_dir())
    except ValueError as error:
        parser.exit(1, str(error) + '\n')
sdk = pathlib.Path(args.sdk).resolve()
platform = sdk / 'platforms/android-35/android.jar'
tools = sdk / 'build-tools/35.0.0'
if not platform.exists() or not (tools / 'aapt2').exists():
    parser.exit(1, 'Install Android SDK platform 35 and build-tools 35.0.0; see android/README.md.\n')
variant = 'unsigned' if args.unsigned else 'debug' if args.debug else 'personal'
build = PROJECT / 'build' / variant
dist = PROJECT / 'dist'
dist.mkdir(exist_ok=True)
if build.exists():
    shutil.rmtree(build)
for folder in ('assets/web', 'generated', 'classes', 'dex'):
    (build / folder).mkdir(parents=True, exist_ok=True)
for name in ('index.html', 'manifest.webmanifest'):
    shutil.copy2(WEB / name, build / 'assets/web' / name)
for name in ('css', 'js', 'icons'):
    shutil.copytree(WEB / name, build / 'assets/web' / name)
entry = build / 'assets/web/index.html'
entry.write_text('\n'.join(line for line in entry.read_text().splitlines() if 'fonts.googleapis.com' not in line and 'fonts.gstatic.com' not in line) + '\n')
manifest = build / 'AndroidManifest.xml'
text = source_manifest.read_text()
manifest.write_text(text.replace('android:debuggable="false"', 'android:debuggable="true"') if args.debug else text)


def run(*cmd):
    subprocess.run([str(v) for v in cmd], check=True)


run(tools / 'aapt2', 'compile', '--dir', PROJECT / 'app/src/main/res', '-o', build / 'resources.zip')
run(tools / 'aapt2', 'link', '-o', build / 'unsigned.apk', '--manifest', manifest, '-I', platform, '--java', build / 'generated', '--custom-package', NAMESPACE, '--min-sdk-version', '26', '--target-sdk-version', '35', '--version-code', version['version_code'], '--version-name', version['version_name'], '--auto-add-overlay', '-A', build / 'assets', build / 'resources.zip')
sources = list((PROJECT / 'app/src/main/java').rglob('*.java')) + list((build / 'generated').rglob('*.java'))
run('java', '-m', 'jdk.compiler/com.sun.tools.javac.Main', '-source', '8', '-target', '8', '-classpath', platform, '-d', build / 'classes', *sources)
run(tools / 'd8', '--min-api', '26', '--lib', platform, '--output', build / 'dex', *list((build / 'classes').rglob('*.class')))
with zipfile.ZipFile(build / 'unsigned.apk', 'a', zipfile.ZIP_DEFLATED) as apk:
    for dex in (build / 'dex').glob('*.dex'):
        apk.write(dex, dex.name)
run(tools / 'zipalign', '-p', '-f', '4', build / 'unsigned.apk', build / 'aligned.apk')
filename = ARTIFACT.replace('.apk', '-unsigned.apk') if args.unsigned else ARTIFACT.replace('.apk', '-debug.apk') if args.debug else ARTIFACT
output = dist / filename
if args.unsigned:
    shutil.copy2(build / 'aligned.apk', output)
else:
    run(tools / 'apksigner', 'sign', '--ks', key, '--ks-key-alias', 'protocolo', '--ks-pass', 'file:' + str(password), '--out', output, build / 'aligned.apk')
    run(tools / 'apksigner', 'verify', '--verbose', output)
if not args.debug:
    try:
        verify(output, sdk, unsigned=args.unsigned, previous=(WEB / 'downloads' / ARTIFACT) if (WEB / 'downloads' / ARTIFACT).exists() else None)
    except (ValueError, subprocess.CalledProcessError):
        output.unlink(missing_ok=True)
        raise
run(tools / 'zipalign', '-c', '-p', '4', output)
if not args.unsigned and not args.debug:
    (dist / (ARTIFACT + '.sha256')).write_text(hashlib.sha256(output.read_bytes()).hexdigest() + '  ' + ARTIFACT + '\n')
print('Unsigned CI build (not installable):' if args.unsigned else 'APK:', output)
print('SHA-256:', hashlib.sha256(output.read_bytes()).hexdigest())
