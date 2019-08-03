# Development guidelines

## Lerna

Lerna is in independent mode (`lerna init --independent`) so that we can version components and utils independently.

## Basic operations

- adding a dependency to all packages: `lerna add -D svelte`
- adding a dependency to a specific package: `lerna add nock -D --scope=@svizzle/request`
- testing a specific package: `lerna run test --scope=@svizzle/utils`

(TODO describe npm scripts)

## Development

- `git checkout dev`
- develop loop: test, code, build, test, repeat
- after the first commit since the last release we can open a PR dev -> master to see all changes across the packages

## Preparing for new versions

In the `dev` branch:

- compile changelog for all changed/new packages using the correct version;
- copy the changelog from all the changed/new packages onto the global changelog;
- based on this, for every changed packages:
   - choose the next version depending on if it's going to be a `patch`, `minor` or `major`;
   - check that `@version <version>` in jsdoc blocks for new functions is correct
- `git rebase -i HEAD~n`:
   - `n` being number of commits since last release
   - as a commit message, paste what you added to the global changelog

## Bumping versions

In the `dev` branch:

- Bump the versions: `lerna version --no-changelog --no-git-tag-version --no-push`:

  Follow instructions to bump changed packages with a `patch`, `minor` or `major` version, accept when ready.

  After accepting, this will:

  - run the `prepublishOnly` script:
    - run cleanups,
    - re-install dependencies,
    - run tests,
    - make builds;
  - bump versions (only allowed in `dev`).

- Create a commit on the repo.

- if something goes wrong or we forgot something and Lerna actually committed:
   - discard the version commit, we have 2 ways:
      - `git revert HEAD`: creates a commit to revert the version commit created by Lerna (we will rebase anyway), or
      - `git reset --hard HEAD~1`: reset the index and the working tree to 1 commit before the commit created by Lerna;
   - edit some code again;
   - **rebase again** the commits since the last release.

- If everything went fine: `git push`

- Merge to master:
   - `git checkout master`
   - `git merge dev`
   - `git push`

## Publishing

- `git checkout master`
- `lerna publish from-package`.

### Tagging / releasing

Shouldn't we use `--no-git-tag-version`, `lerna version` would create one tag per package:

```
$ git tag
@svizzle/dev@0.1.0
@svizzle/dom@0.1.0
@svizzle/file@0.1.0
@svizzle/geo@0.1.0
@svizzle/geometry@0.1.0
@svizzle/request@0.1.0
@svizzle/utils@0.1.0
```

We could push them [1] but:
- it would be tedious
- we'd get tags all cluttered as they'd contain one tag per package release, each containing all of the other packages at the time of the publication, so lots of repetitions going on.

Instead we'll tag manually a bunch of releases together:

- `git tag -a 20190220`
- `git push origin 20190220`
- (`git push origin :20190220` to delete it if needs to be done again)

[1] one by one with `git push origin @svizzle/dev@0.1.0` etc, don't use `git push --all`