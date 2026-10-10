#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

function parseArguments(argv) {
  const options = {
    preparedDirectory: null,
    bucket: null,
    verify: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--prepared") {
      options.preparedDirectory = path.resolve(argv[++index]);
    } else if (argument === "--bucket") {
      options.bucket = argv[++index];
    } else if (argument === "--no-verify") {
      options.verify = false;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.preparedDirectory) {
    throw new Error("--prepared <directory> is required.");
  }
  if (!options.bucket || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/u.test(options.bucket)) {
    throw new Error("--bucket must be a valid R2 bucket name.");
  }
  return options;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function runWrangler(arguments_) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(executable, ["wrangler", ...arguments_], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const manifest = JSON.parse(
    await readFile(path.join(options.preparedDirectory, "manifest.json"), "utf8"),
  );
  const variants = new Map();
  for (const object of manifest.objects ?? []) {
    for (const variantName of ["original", "display", "thumbnail"]) {
      const variant = object[variantName];
      variants.set(variant.key, variant);
    }
  }

  const verificationDirectory = options.verify
    ? await mkdtemp(path.join(os.tmpdir(), "magnifico-r2-verify-"))
    : null;
  const uploaded = [];

  try {
    for (const variant of variants.values()) {
      const source = path.join(
        options.preparedDirectory,
        ...variant.localPath.split("/"),
      );
      const localBytes = await readFile(source);
      if (sha256(localBytes) !== variant.sha256) {
        throw new Error(`Prepared file checksum mismatch: ${variant.localPath}`);
      }

      process.stdout.write(`Uploading ${variant.key}\n`);
      runWrangler([
        "r2",
        "object",
        "put",
        `${options.bucket}/${variant.key}`,
        "--remote",
        "--force",
        "--file",
        source,
        "--content-type",
        variant.contentType,
        "--cache-control",
        variant.cacheControl,
      ]);

      if (verificationDirectory) {
        const downloaded = path.join(
          verificationDirectory,
          `${sha256(variant.key)}.bin`,
        );
        runWrangler([
          "r2",
          "object",
          "get",
          `${options.bucket}/${variant.key}`,
          "--remote",
          "--file",
          downloaded,
        ]);
        if (sha256(await readFile(downloaded)) !== variant.sha256) {
          throw new Error(`R2 verification failed: ${variant.key}`);
        }
      }

      uploaded.push({
        key: variant.key,
        bytes: variant.bytes,
        sha256: variant.sha256,
        verified: Boolean(verificationDirectory),
      });
    }

    const result = {
      completedAt: new Date().toISOString(),
      bucket: options.bucket,
      uploaded,
    };
    await writeFile(
      path.join(options.preparedDirectory, "upload-result.json"),
      `${JSON.stringify(result, null, 2)}\n`,
      "utf8",
    );
    process.stdout.write(`Uploaded and verified ${uploaded.length} R2 objects.\n`);
  } finally {
    if (verificationDirectory) {
      await rm(verificationDirectory, { recursive: true, force: true });
    }
  }
}

await main();
