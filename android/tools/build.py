#!/usr/bin/env python3
"""Build an offline, signed APK with official SDK tools; no paid service or Gradle is required."""
import argparse, hashlib, os, pathlib, secrets, shutil, subprocess, zipfile

PROJECT=pathlib.Path(__file__).resolve().parents[1]
WEB=PROJECT.parent
parser=argparse.ArgumentParser()
parser.add_argument('--sdk',default=os.environ.get('ANDROID_SDK_ROOT',str(WEB.parent/'android-tools/sdk')))
parser.add_argument('--debug',action='store_true',help='Test build; enables Android WebView inspection. Do not distribute this variant.')
args=parser.parse_args()
sdk=pathlib.Path(args.sdk).resolve()
platform=sdk/'platforms/android-35/android.jar'
choices=list((sdk/'build-tools').glob('*/aapt2'))
if not platform.exists() or not choices:raise SystemExit('Install Android SDK platform 35 and build-tools 35.0.0 first; see android/README.md.')
tools=next((p.parent for p in choices if p.parent.name=='35.0.0'),choices[0].parent)
variant='debug' if args.debug else 'personal'
build=PROJECT/'build'/variant
dist=PROJECT/'dist';dist.mkdir(exist_ok=True)
if build.exists():shutil.rmtree(build)
for folder in ('assets/web','generated','classes','dex'): (build/folder).mkdir(parents=True,exist_ok=True)
for name in ('index.html','manifest.webmanifest'):shutil.copy2(WEB/name,build/'assets/web'/name)
for name in ('css','js','icons'):shutil.copytree(WEB/name,build/'assets/web'/name)
# Android is offline-first: avoid remote font requests in the bundled entry page.
entry=build/'assets/web/index.html'
entry.write_text('\n'.join(line for line in entry.read_text().splitlines() if 'fonts.googleapis.com' not in line and 'fonts.gstatic.com' not in line)+'\n')
manifest=build/'AndroidManifest.xml'
manifest.write_text((PROJECT/'app/src/main/AndroidManifest.xml').read_text().replace('android:debuggable="false"','android:debuggable="true"') if args.debug else (PROJECT/'app/src/main/AndroidManifest.xml').read_text())

def run(*cmd):subprocess.run([str(v) for v in cmd],check=True)
run(tools/'aapt2','compile','--dir',PROJECT/'app/src/main/res','-o',build/'resources.zip')
run(tools/'aapt2','link','-o',build/'unsigned.apk','--manifest',manifest,'-I',platform,'--java',build/'generated','--min-sdk-version','26','--target-sdk-version','35','--version-code','2','--version-name','1.1','--auto-add-overlay','-A',build/'assets',build/'resources.zip')
sources=list((PROJECT/'app/src/main/java').rglob('*.java'))+list((build/'generated').rglob('*.java'))
run('java','-m','jdk.compiler/com.sun.tools.javac.Main','-source','8','-target','8','-classpath',platform,'-d',build/'classes',*sources)
run(tools/'d8','--min-api','26','--lib',platform,'--output',build/'dex',*list((build/'classes').rglob('*.class')))
with zipfile.ZipFile(build/'unsigned.apk','a',zipfile.ZIP_DEFLATED) as apk:
 for dex in (build/'dex').glob('*.dex'):apk.write(dex,dex.name)
run(tools/'zipalign','-p','-f','4',build/'unsigned.apk',build/'aligned.apk')
# Keep signing material outside Git and reuse it for upgrades that preserve user data.
signing=pathlib.Path(os.environ.get('PROTOCOLO_SIGNING_DIR',str(WEB.parent/'.protocolo-android-signing')))
signing.mkdir(mode=0o700,parents=True,exist_ok=True)
key=signing/'personal.p12';password=signing/'password.txt'
if key.exists()!=password.exists():raise SystemExit('Signing key/password file is incomplete. Restore the original signing files; do not replace the key.')
if not key.exists():
 password.write_text(secrets.token_urlsafe(32)+'\n');password.chmod(0o600)
 run('keytool','-genkeypair','-keystore',key,'-storetype','PKCS12','-storepass:file',password,'-keypass:file',password,'-alias','protocolo','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Protocolo Pessoal,O=Protocolo')
 key.chmod(0o600)
output=dist/('Protocolo-debug.apk' if args.debug else 'Protocolo.apk')
run(tools/'apksigner','sign','--ks',key,'--ks-key-alias','protocolo','--ks-pass','file:'+str(password),'--out',output,build/'aligned.apk')
run(tools/'apksigner','verify','--verbose',output)
run(tools/'zipalign','-c','-p','4',output)
print('APK:',output)
print('SHA-256:',hashlib.sha256(output.read_bytes()).hexdigest())
