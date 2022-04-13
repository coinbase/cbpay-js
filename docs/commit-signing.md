# Commit Signing

This repository requires commit signing. This document outlines how to get commit signing setup for this repo.

## Generate a GPG key

If you're on a Mac, you can install the `gpg` CLI via homebrew with

```shell
brew install gpg
```

Then you can use the `gpg` tool to generate a keypair:

```shell
gpg --default-new-key-algo rsa4096 --quick-generate-key --batch --passphrase "" "Firstname Lastname <youremail@provider.com>"
```

Replace `youremail@provider.com` with your actual email. **Leave the angle brackets though!**

## Upload your public key to GitHub

From your GitHub settings (SSH & GPG Keys), you'll need to upload your recently-generated GPG public key. You can use the following command to grab that key:

```shell
gpg --armor --export youremail@provider.com | pbcopy
```

This should copy your public key to your clipboard, and you can paste this into your GitHub settings page (for adding a new GPG key).

## Enabling git signing for this repo

Now, let's set a few git options **local for this repo**. Make sure you're `cd`'d into this repo and then run the following.

```shell
# Use your public GitHub credentials
git config user.name "Firstname Lastname"
git config user.email "youremail@provider.com"
# Set up commit signing
git config user.signingkey youremail@provider.com 
git config user.gpgsign true
```

Notice the *lack* of `--global` flag in those commands. This will set these git credentials/configuration for just this repository.