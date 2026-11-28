import fs from "node:fs"
import path from "node:path"
import { registerHooks } from "node:module"
import { pathToFileURL } from "node:url"

const projectRoot = process.cwd()

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const basePath = path.resolve(projectRoot, specifier.slice(2))
      const candidates = [
        basePath,
        `${basePath}.ts`,
        `${basePath}.tsx`,
        `${basePath}.js`,
        `${basePath}.mjs`,
        path.join(basePath, "index.ts"),
        path.join(basePath, "index.js"),
      ]

      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return nextResolve(pathToFileURL(candidate).href, context)
        }
      }
    }

    return nextResolve(specifier, context)
  },
})
