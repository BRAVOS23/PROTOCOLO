#!/usr/bin/env python3
"""Restore/check the existing signing identity. Never generate a replacement key."""
import argparse
import base64
import binascii
import hashlib
import os
import pathlib
import shutil
import subprocess
import tempfile
import zipfile

PROJECT = pathlib.Path(__file__).resolve().parents[1]
SECRETS = ('ANDROID_KEYSTORE_BASE64', 'ANDROID_KEYSTORE_PASSWORD')


def signing_dir():
    return pathlib.Path(os.environ.get('PROTOCOLO_SIGNING_DIR', str(PROJECT.parent.parent / '.protocolo-novo-signing'))).resolve()


def expected_certificate():
    value = (PROJECT / 'signing-certificate.sha256').read_text().strip().lower()
    if len(value) != 64 or any(c not in '0123456789abcdef' for c in value):
        raise ValueError('Invalid public signing certificate fingerprint')
    return value


def validate(folder):
    folder = pathlib.Path(folder)
    key, password = folder / 'personal.p12', folder / 'password.txt'
    if not key.is_file() or not password.is_file():
        raise ValueError('Signing key missing. Restore the original private backup or configure the two GitHub Actions secrets. No replacement key will be generated.')
    command = ['keytool', '-exportcert', '-alias', 'protocolo', '-keystore', str(key), '-storepass:file', str(password)]
    result = subprocess.run(command, capture_output=True)
    if result.returncode:
        raise ValueError('Cannot open the signing key with this password. Restore the original matching files.')
    if hashlib.sha256(result.stdout).hexdigest() != expected_certificate():
        raise ValueError('Signing certificate differs from Protocolo Novo. Refusing to replace the installed app identity.')
    return key, password


def restore(destination):
    missing = [name for name in SECRETS if not os.environ.get(name)]
    if missing:
        raise ValueError('Configure GitHub Actions secrets: ' + ', '.join(missing) + '. See docs/ANDROID_RELEASES.md.')
    try:
        key = base64.b64decode(''.join(os.environ[SECRETS[0]].split()), validate=True)
    except (ValueError, binascii.Error):
        raise ValueError('ANDROID_KEYSTORE_BASE64 is not valid base64') from None
    password = os.environ[SECRETS[1]].rstrip('\r\n')
    destination = pathlib.Path(destination).resolve()
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Signing destination is not empty; refusing to overwrite existing files')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.protocolo-restore-', dir=destination.parent) as tmp:
        folder = pathlib.Path(tmp)
        (folder / 'personal.p12').write_bytes(key)
        (folder / 'password.txt').write_text(password + '\n')
        for file in folder.iterdir():
            file.chmod(0o600)
        validate(folder)
        destination.mkdir(mode=0o700, exist_ok=True)
        destination.chmod(0o700)
        for name in ('personal.p12', 'password.txt'):
            shutil.copy2(folder / name, destination / name)
    return destination


def export_setup(destination):
    key, password = validate(signing_dir())
    destination = pathlib.Path(destination).resolve()
    if destination.is_relative_to(PROJECT.parent):
        raise ValueError('Private signing setup must be saved outside the Git checkout')
    destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    instructions = '''CONFIGURACAO PRIVADA DO PROTOCOLO NOVO\n\nNao publiques este ZIP ou os seus ficheiros no repositorio.\n\n1. Abre https://github.com/BRAVOS23/PROTOCOLO/settings/secrets/actions\n2. New repository secret: ANDROID_KEYSTORE_BASE64\n   Cola o conteudo completo de ANDROID_KEYSTORE_BASE64.txt.\n3. New repository secret: ANDROID_KEYSTORE_PASSWORD\n   Cola o conteudo de ANDROID_KEYSTORE_PASSWORD.txt.\n\nOs valores devem ficar apenas nos campos de segredo do GitHub.\nPara restaurar a compilacao local, guarda personal.p12 e password.txt numa pasta privada e define PROTOCOLO_SIGNING_DIR para essa pasta.\nGuarda este ZIP em local privado para recuperacao.\n'''
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.write(key, 'personal.p12')
        archive.write(password, 'password.txt')
        archive.writestr('ANDROID_KEYSTORE_BASE64.txt', base64.b64encode(key.read_bytes()).decode() + '\n')
        archive.writestr('ANDROID_KEYSTORE_PASSWORD.txt', password.read_text())
        archive.writestr('LE-ME.txt', instructions)
    destination.chmod(0o600)
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'restore', 'export-setup'])
    parser.add_argument('--output')
    args = parser.parse_args()
    try:
        if args.command == 'check':
            validate(signing_dir())
            print('Signing identity verified.')
        elif args.command == 'restore':
            restore(signing_dir())
            print('Signing files restored and identity verified.')
        else:
            if not args.output:
                parser.error('--output is required for export-setup')
            export_setup(args.output)
            print('Private GitHub setup saved outside the repository. No secret values were printed.')
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
