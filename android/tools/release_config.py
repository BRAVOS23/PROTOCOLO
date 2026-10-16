"""One version definition shared by the standalone build and Gradle."""
import json
import pathlib
import re

PROJECT = pathlib.Path(__file__).resolve().parents[1]
APPLICATION_ID = 'app.protocolo.mobile'
NAMESPACE = 'app.protocolo.android'
ARTIFACT = 'Protocolo-Novo.apk'


def load_version(path=None):
    data = json.loads(pathlib.Path(path or PROJECT / 'release.json').read_text())
    if set(data) != {'version_code', 'version_name'}:
        raise ValueError('release.json must contain only version_code and version_name')
    code, name = data['version_code'], data['version_name']
    if type(code) is not int or not 1 <= code <= 2100000000:
        raise ValueError('version_code must be a positive Android version integer')
    if not isinstance(name, str) or not re.fullmatch(r'\d+\.\d+(?:[.\-][A-Za-z0-9]+)*', name):
        raise ValueError('version_name must be a version such as 2.0 or 2.1')
    return data
