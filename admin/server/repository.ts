import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "./errors";
import { blankSystem, defaultDesignLanguage, loadPreset, type PresetId } from "./presets";
import {
  extractColorMap,
  slugify,
  TokensSchema,
  type DesignTokens,
} from "./tokens";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type DesignSystemSummary = {
  slug: string;
  name: string;
  version?: string;
  source?: string;
  colors: Record<string, string>;
};

export type DesignSystemDetail = {
  slug: string;
  tokens: DesignTokens;
  designLanguageMd: string;
};

export type SystemsRepository = {
  list(): DesignSystemSummary[];
  get(slug: string): DesignSystemDetail;
  create(input: {
    name: string;
    slug?: string;
    preset?: PresetId;
  }): DesignSystemDetail;
  update(
    slug: string,
    input: { tokens: DesignTokens; designLanguageMd?: string },
  ): DesignSystemDetail;
  delete(slug: string): void;
  exportToProject(slug: string, projectRoot: string): { path: string };
  getProjectContract(projectRoot: string): DesignSystemDetail;
  putProjectContract(
    projectRoot: string,
    input: { tokens: DesignTokens; designLanguageMd?: string },
  ): DesignSystemDetail;
};

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function parseTokens(raw: string, context: string): DesignTokens {
  try {
    return TokensSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new ApiError(400, "invalid_tokens", `Invalid tokens in ${context}`, err);
  }
}

function readContractDir(dir: string, slug: string): DesignSystemDetail {
  const tokensFile = join(dir, "tokens.json");
  if (!existsSync(tokensFile)) {
    throw new ApiError(404, "not_found", `Design system "${slug}" not found`);
  }
  const tokens = parseTokens(readFileSync(tokensFile, "utf8"), tokensFile);
  const langFile = join(dir, "design-language.md");
  const designLanguageMd = existsSync(langFile)
    ? readFileSync(langFile, "utf8")
    : "";
  return { slug, tokens, designLanguageMd };
}

function writeContractDir(
  dir: string,
  tokens: DesignTokens,
  designLanguageMd: string,
) {
  ensureDir(dir);
  const parsed = TokensSchema.parse(tokens);
  writeFileSync(join(dir, "tokens.json"), JSON.stringify(parsed, null, 2) + "\n");
  writeFileSync(join(dir, "design-language.md"), designLanguageMd);
}

export function createFsRepository(options?: {
  libraryRoot?: string;
}): SystemsRepository {
  const libraryRoot =
    options?.libraryRoot ||
    process.env.DESIGNALIGN_SYSTEMS_DIR ||
    resolve(join(__dirname, "../../systems"));

  ensureDir(libraryRoot);

  return {
    list() {
      ensureDir(libraryRoot);
      const summaries: DesignSystemSummary[] = [];
      for (const d of readdirSync(libraryRoot, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        try {
          const detail = readContractDir(join(libraryRoot, d.name), d.name);
          summaries.push({
            slug: d.name,
            name: detail.tokens.name,
            version: detail.tokens.version,
            source: detail.tokens.source,
            colors: extractColorMap(detail.tokens),
          });
        } catch {
          // skip invalid system folders
        }
      }
      return summaries.sort((a, b) => a.name.localeCompare(b.name));
    },

    get(slug: string) {
      return readContractDir(join(libraryRoot, slug), slug);
    },

    create({ name, slug: requestedSlug, preset }) {
      const slug = slugify(requestedSlug || name);
      if (!slug) {
        throw new ApiError(400, "invalid_slug", "Name produced an empty slug");
      }
      const dir = join(libraryRoot, slug);
      if (existsSync(dir)) {
        throw new ApiError(409, "conflict", `System "${slug}" already exists`);
      }
      const tokens = preset ? loadPreset(preset) : blankSystem(name);
      tokens.name = name;
      const designLanguageMd = defaultDesignLanguage(name);
      writeContractDir(dir, tokens, designLanguageMd);
      return readContractDir(dir, slug);
    },

    update(slug, { tokens, designLanguageMd }) {
      const dir = join(libraryRoot, slug);
      if (!existsSync(join(dir, "tokens.json"))) {
        throw new ApiError(404, "not_found", `Design system "${slug}" not found`);
      }
      const existing = readContractDir(dir, slug);
      const lang =
        designLanguageMd !== undefined
          ? designLanguageMd
          : existing.designLanguageMd;
      writeContractDir(dir, tokens, lang);
      return readContractDir(dir, slug);
    },

    delete(slug) {
      const dir = join(libraryRoot, slug);
      if (!existsSync(dir)) {
        throw new ApiError(404, "not_found", `Design system "${slug}" not found`);
      }
      rmSync(dir, { recursive: true, force: true });
    },

    exportToProject(slug, projectRoot) {
      const detail = this.get(slug);
      const root = resolve(projectRoot);
      const target = join(root, "designalign");
      writeContractDir(target, detail.tokens, detail.designLanguageMd);
      return { path: target };
    },

    getProjectContract(projectRoot) {
      const root = resolve(projectRoot);
      const dir = join(root, "designalign");
      return readContractDir(dir, "current");
    },

    putProjectContract(projectRoot, { tokens, designLanguageMd }) {
      const root = resolve(projectRoot);
      const dir = join(root, "designalign");
      const existingLang = existsSync(join(dir, "design-language.md"))
        ? readFileSync(join(dir, "design-language.md"), "utf8")
        : defaultDesignLanguage(tokens.name);
      writeContractDir(
        dir,
        tokens,
        designLanguageMd !== undefined ? designLanguageMd : existingLang,
      );
      return this.getProjectContract(root);
    },
  };
}
