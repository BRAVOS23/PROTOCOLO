#!/usr/bin/env python3
"""Download pinned SDK artifacts; require the checksums in Google's TLS-protected repository."""
import argparse,hashlib,pathlib,urllib.request,xml.etree.ElementTree as E,zipfile,shutil
parser=argparse.ArgumentParser();parser.add_argument('--sdk',default=str(pathlib.Path(__file__).resolve().parents[3]/'android-tools/sdk'));args=parser.parse_args()
sdk=pathlib.Path(args.sdk).resolve();sdk.mkdir(parents=True,exist_ok=True)
base='https://dl.google.com/android/repository/'
with urllib.request.urlopen(base+'repository2-1.xml',timeout=60) as response:repository=E.fromstring(response.read())
for package,name,destination in [('build-tools;35.0.0','build-tools_r35_linux.zip',sdk/'build-tools'),('platforms;android-35','platform-35_r02.zip',sdk/'platforms')]:
 archives=[a.find('complete') for p in repository.findall('remotePackage') if p.get('path')==package for a in p.findall('archives/archive') if a.findtext('host-os') in (None,'linux') and a.findtext('complete/url')==name]
 if len(archives)!=1:raise SystemExit('Official artifact metadata unavailable: '+name)
 a=archives[0];archive=sdk.parent/name
 if not archive.exists():
  with urllib.request.urlopen(base+name,timeout=60) as response,archive.open('wb') as output:
   while chunk:=response.read(1024*1024):output.write(chunk)
 if archive.stat().st_size!=int(a.findtext('size')) or hashlib.sha1(archive.read_bytes()).hexdigest()!=a.findtext('checksum'):raise SystemExit('Artifact verification failed: '+name)
 destination.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(archive) as contents:
  contents.extractall(destination)
  for entry in contents.infolist():
   mode=(entry.external_attr>>16)&0o777
   if mode and not entry.is_dir():(destination/entry.filename).chmod(mode)
 if package.startswith('build-tools') and (destination/'android-15').exists():
  if (destination/'35.0.0').exists():shutil.rmtree(destination/'android-15')
  else:(destination/'android-15').rename(destination/'35.0.0')
 print('Verified',package)
