# @internal/backstage-plugin-scaffolder-backend-module-generic-git

The generic-git module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

_This plugin was created through the Backstage CLI_

This plugin allows you to perform git actions against any git repo using ssh through scaffolder action.

The authorization keys (both git auth over ssh and optional gpg signature) need to be referenced in configuration and you should treat the private key files as secrets.

Configuration also includes username and email.

This plugin was built to allow the use of a shared mono repo for gitops configuration.

## git clone

The `git:clone` action clones a git repo, by default it is a shallow copy to save space. The repo is stored in the folder name of your designation, or the name of the repo by default in the scaffold action's current working directory.

## git checkout

The `git:checkout` action checks out a remote or creates a local branch.

## git add + commit

The `git:commitAllChanges` action adds/stages all changes and commits them. The message can be set, defaults to "scaffolder action". The gpg key is optional, defaults to not signing commits.

## git push

The `git:push` action pushes commits to the remote branch. The branch gets created on the remote if it doesn't exist.