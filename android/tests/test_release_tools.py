#!/usr/bin/env python3
"""Regression checks for restoring signing material without exposing or replacing it."""
import base64
import json
import os
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools'))
from release_config import load_version
from signing import restore, validate


class ReleaseToolsTest(unittest.TestCase):
    def test_invalid_version_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = pathlib.Path(tmp) / 'version.json'
            for code, name in [(0, '2.0'), (True, '2.0'), (1, '../bad'), (2100000001, '2.0')]:
                file.write_text(json.dumps({'version_code': code, 'version_name': name}))
                with self.assertRaises(ValueError):
                    load_version(file)
            file.write_text('{"version_code":2,"version_name":"2.1"}')
            self.assertEqual(load_version(file)['version_code'], 2)

    def test_missing_key_does_not_generate_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(ValueError, 'No replacement key'):
                validate(tmp)
            self.assertEqual(list(pathlib.Path(tmp).iterdir()), [])

    def test_missing_secrets_are_named_without_values(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {}, clear=True):
            target = pathlib.Path(tmp) / 'signing'
            with self.assertRaisesRegex(ValueError, 'ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD'):
                restore(target)
            self.assertFalse(target.exists())

    def test_invalid_base64_does_not_leak_secret(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {'ANDROID_KEYSTORE_BASE64':'not-valid-private-input!', 'ANDROID_KEYSTORE_PASSWORD':'private-test-password'}, clear=True):
            with self.assertRaises(ValueError) as error:
                restore(pathlib.Path(tmp) / 'signing')
            self.assertNotIn('not-valid-private-input', str(error.exception))
            self.assertNotIn('private-test-password', str(error.exception))

    def test_existing_key_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = pathlib.Path(tmp) / 'signing'
            target.mkdir()
            (target / 'personal.p12').write_bytes(b'original-test-fixture')
            with patch.dict(os.environ, {'ANDROID_KEYSTORE_BASE64':base64.b64encode(b'new-test-fixture').decode(), 'ANDROID_KEYSTORE_PASSWORD':'test-only'}, clear=True):
                with self.assertRaisesRegex(ValueError, 'refusing to overwrite'):
                    restore(target)
            self.assertEqual((target / 'personal.p12').read_bytes(), b'original-test-fixture')

    def test_wrong_identity_is_discarded_before_installing(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {'ANDROID_KEYSTORE_BASE64':base64.b64encode(b'test-only-fixture').decode(), 'ANDROID_KEYSTORE_PASSWORD':'test-only'}, clear=True), patch('signing.validate', side_effect=ValueError('wrong certificate')):
            target = pathlib.Path(tmp) / 'signing'
            with self.assertRaisesRegex(ValueError, 'wrong certificate'):
                restore(target)
            self.assertFalse(target.exists())
            self.assertEqual(list(pathlib.Path(tmp).iterdir()), [])


if __name__ == '__main__':
    unittest.main()
