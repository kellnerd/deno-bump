import info from "./deno.json" with { type: "json" };
import { Command, EnumType } from "@cliffy/command";
import { format, increment, parse } from "@std/semver";

/** Information about the package, for example from a `deno.json` file. */
interface PackageInfo {
  version: string;
}

/** Reads the JSON content of the given package info file. */
async function readPackageInfo(path: string): Promise<PackageInfo> {
  const text = await Deno.readTextFile(path);
  const json = JSON.parse(text);
  if (typeof json.version === "string") {
    return json;
  } else {
    throw new Error(`${path} contains no "version" string`);
  }
}

/** Overwrites the given package info file with JSON content. */
async function writePackageInfo(json: PackageInfo, path: string) {
  const text = JSON.stringify(json, null, 2) + "\n";
  await Deno.writeTextFile(path, text);
}

/** Executes the given git command as a child process. */
async function runGitCommand(...args: string[]) {
  const git = new Deno.Command("git", { args });
  const { success, stderr } = await git.output();
  if (!success) {
    const textDecoder = new TextDecoder();
    const gitError = textDecoder.decode(stderr).trim();
    throw new Error(gitError);
  }
}

/** Cliffy command line interface. */
export const cli = new Command()
  .name("bump")
  .version(info.version)
  .description(`
    Increment the semantic version of the package in the current directory.

    Bumps the patch version, unless a version step (minor, major) is specified.
    Optionally creates a git commit with the package file changes and/or a tag.
  `)
  .type("version-step", new EnumType(["patch", "minor", "major"]))
  .arguments("[version-step:version-step]")
  .option(
    "-f, --file <json-path:file>",
    "Update the version of the given JSON package file.",
    { default: "deno.json" },
  )
  .option(
    "-c, --commit [message-prefix]",
    "Create a git commit with the given commit message prefix.",
  )
  .option(
    "-t, --tag [prefix]",
    "Create a git tag with the given version prefix.",
  )
  .action(async ({ file, commit, tag }, step = "patch") => {
    const packageInfo = await readPackageInfo(file);
    const oldVersion = packageInfo.version;
    const newVersion = format(increment(parse(oldVersion), step));
    console.log(`Bump version from ${oldVersion} to ${newVersion} (${step})`);

    packageInfo.version = newVersion;
    await writePackageInfo(packageInfo, file);

    if (commit) {
      const message = commit === true ? newVersion : commit + newVersion;
      console.log("Create commit:", message);
      await runGitCommand("commit", "-am", message);
    }

    if (tag) {
      const tagName = tag === true ? newVersion : tag + newVersion;
      console.log("Create tag:", tagName);
      await runGitCommand("tag", tagName);
    }
  });

if (import.meta.main) {
  await cli.parse();
}
