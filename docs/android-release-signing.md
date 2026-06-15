# Android release signing

The GitHub Action in this repo expects these repository secrets:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded contents of the `release.jks` file
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password
- `ANDROID_KEY_ALIAS`: the alias inside the keystore. The bundled generator workflow uses `release`.
- `ANDROID_KEY_PASSWORD`: the private key password. If it matches the keystore password, the Android build now falls back to `ANDROID_KEYSTORE_PASSWORD` when this value is blank.

## Recommended setup

1. Run the `Generate Keystore` workflow in GitHub.
2. Download the `keystore` artifact.
3. Set `ANDROID_KEYSTORE_BASE64` to the contents of `release.jks.base64.txt`.
4. Set `ANDROID_KEYSTORE_PASSWORD` to the `store_password` you used.
5. Set `ANDROID_KEY_ALIAS` to `release` unless you generated the keystore differently.
6. Set `ANDROID_KEY_PASSWORD` to the `key_password` you used.

## Current CI failure pattern

If the build fails with:

`Failed to read key ... Given final block not properly padded`

the keystore itself was decoded, but the private key could not be decrypted. In practice that means one of these is wrong:

- `ANDROID_KEY_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_BASE64` does not belong to the passwords and alias above
