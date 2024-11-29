# bump

Deno CLI to increment the semantic version of the package in the current directory.

Bumps the patch version, unless a version step (minor, major) is specified.

Try it out in a directory with a `deno.json` file, it will ask for the necessary permissions:

```sh
deno run jsr:@kellnerd/bump
```

Optionally it can create a git commit with the package file changes and/or a tag.  
See the integrated help to learn more:

```sh
deno run jsr:@kellnerd/bump --help
```

## Setup

Install the CLI with the permissions you need, for example:

```sh
deno install --global --allow-read=deno.json --allow-write=deno.json --allow-run=git jsr:@kellnerd/bump
```

Now you can use it by simply executing `bump`.

## Usage Examples

Increment the minor version in `deno.json`:

```sh
bump minor
```

Alternatively you can also increment the major version or the patch version. 

Explicitly specify the JSON package file which should be updated:

```sh
bump --file jsr.json
```

Automatically commit the changed `deno.json` file using a conventional commit message:

```sh
bump patch --commit "chore: Release version "
```

Additionally create a tag with a version prefix:

```sh
bump major --commit "chore: Release version " --tag v
```

If the previous version was `1.2.3`, the new version will be `2.0.0`.
A commit with the message `chore: Release version 2.0.0` will be created and tagged as `v2.0.0`.
