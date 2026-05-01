import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const iconsDirectory = path.join(projectRoot, "src/assets/icons");
const iconMapPath = path.join(
  projectRoot,
  "src/components/structure/Icon/icon-map.json"
);
const outputPath = path.join(
  projectRoot,
  "src/components/structure/Icon/generated.tsx"
);

await main();

async function main() {
  const iconMap = await loadIconMap();
  const availableFiles = await getAvailableSvgFiles();
  const generatedIcons = [];

  warnAboutUnmappedFiles(iconMap, availableFiles);

  for (const [iconName, fileName] of Object.entries(iconMap)) {
    const filePath = path.join(iconsDirectory, fileName);

    if (!availableFiles.has(fileName)) {
      throw new Error(
        `Mapped icon "${iconName}" points to "${fileName}", but that file was not found in ${iconsDirectory}.`
      );
    }

    const svgSource = await readFile(filePath, "utf8");
    generatedIcons.push({
      componentName: `${toPascalCase(iconName)}Icon`,
      iconName,
      ...transformSvg(svgSource),
    });
  }

  const fileContents = createGeneratedFile(generatedIcons);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, fileContents, "utf8");

  console.log(
    `Generated ${generatedIcons.length} icon components at ${path.relative(projectRoot, outputPath)}.`
  );
}

async function loadIconMap() {
  const fileContents = await readFile(iconMapPath, "utf8");
  const parsed = JSON.parse(fileContents);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The icon map must be a JSON object of icon names to SVG file names.");
  }

  for (const [iconName, fileName] of Object.entries(parsed)) {
    if (typeof fileName !== "string" || !fileName.endsWith(".svg")) {
      throw new Error(
        `The icon map entry "${iconName}" must point to an .svg file. Received: ${String(fileName)}.`
      );
    }
  }

  return parsed;
}

async function getAvailableSvgFiles() {
  const fileEntries = await readdir(iconsDirectory, { withFileTypes: true });

  return new Set(
    fileEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
      .map((entry) => entry.name)
  );
}

function warnAboutUnmappedFiles(iconMap, availableFiles) {
  const mappedFiles = new Set(Object.values(iconMap));
  const unmappedFiles = Array.from(availableFiles).filter(
    (fileName) => !mappedFiles.has(fileName)
  );

  if (!unmappedFiles.length) return;

  console.warn(
    `The following SVG files are not registered in icon-map.json and will not be available in the Icon component: ${unmappedFiles.join(", ")}`
  );
}

function transformSvg(svgSource) {
  const cleanedSource = svgSource
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const match = cleanedSource.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);

  if (!match) {
    throw new Error("Unable to parse SVG file contents.");
  }

  const svgAttributes = match[1] ?? "";
  const innerMarkup = match[2] ?? "";
  const viewBox = readAttribute(svgAttributes, "viewBox");

  if (!viewBox) {
    throw new Error("Every SVG icon must define a viewBox attribute.");
  }

  const fill = readAttribute(svgAttributes, "fill");
  const preserveAspectRatio = readAttribute(svgAttributes, "preserveAspectRatio");
  const normalizedInnerMarkup = normalizeColorAttributes(innerMarkup)
    .replace(/>\s+</g, "><")
    .trim();

  return {
    fill,
    innerMarkup: normalizedInnerMarkup,
    preserveAspectRatio,
    viewBox,
  };
}

function readAttribute(source, attributeName) {
  const escapedAttributeName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(
    new RegExp(`${escapedAttributeName}\\s*=\\s*(['"])(.*?)\\1`, "i")
  );

  return match?.[2];
}

function normalizeColorAttributes(source) {
  return source.replace(
    /\b(fill|stroke)=["']([^"']+)["']/gi,
    (match, attributeName, attributeValue) => {
      const normalizedValue = attributeValue.trim();

      if (
        normalizedValue === "none" ||
        normalizedValue === "currentColor" ||
        normalizedValue.startsWith("url(")
      ) {
        return `${attributeName}="${normalizedValue}"`;
      }

      return `${attributeName}="currentColor"`;
    }
  );
}

function toPascalCase(value) {
  return value
    .replace(/(^\w|[-_\s]\w)/g, (segment) =>
      segment.replace(/[-_\s]/g, "").toUpperCase()
    )
    .replace(/[^\w]/g, "");
}

function createGeneratedFile(icons) {
  const iconNames = icons.map((icon) => icon.iconName);
  const componentDefinitions = icons
    .map((icon) => {
      const baseProps = {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: icon.viewBox,
      };

      if (icon.fill) {
        baseProps.fill = icon.fill;
      }

      if (icon.preserveAspectRatio) {
        baseProps.preserveAspectRatio = icon.preserveAspectRatio;
      }

      return `export const ${icon.componentName} = createIcon(
  ${JSON.stringify(baseProps, null, 2)},
  ${JSON.stringify(icon.innerMarkup)}
);`;
    })
    .join("\n\n");

  const componentMapEntries = icons
    .map((icon) => `  ${JSON.stringify(icon.iconName)}: ${icon.componentName},`)
    .join("\n");

  return `/* eslint-disable */
// This file is auto-generated by scripts/generate-icons.mjs.
// Do not edit it manually.

import { useId, type ReactElement, type SVGProps } from "react";

export const ICON_NAMES = ${JSON.stringify(iconNames, null, 2)} as const;

export type IconName = (typeof ICON_NAMES)[number];
export type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

function createIcon(
  baseProps: SVGProps<SVGSVGElement>,
  rawInnerHtml: string
): IconComponent {
  return function GeneratedIcon(props) {
    const scopeId = useId().replace(/:/g, "_");
    const scopedInnerHtml = scopeSvgIds(rawInnerHtml, scopeId);

    return (
      <svg
        {...baseProps}
        {...props}
        dangerouslySetInnerHTML={{ __html: scopedInnerHtml }}
      />
    );
  };
}

function scopeSvgIds(innerHtml: string, scopeId: string) {
  return innerHtml
    .replace(/id="([^"]+)"/g, (_match, id) => \`id="\${scopeId}__\${id}"\`)
    .replace(/url\\(#([^)]+)\\)/g, (_match, id) => \`url(#\${scopeId}__\${id})\`)
    .replace(/href="#([^"]+)"/g, (_match, id) => \`href="#\${scopeId}__\${id}"\`)
    .replace(/xlink:href="#([^"]+)"/g, (_match, id) => \`xlink:href="#\${scopeId}__\${id}"\`);
}

${componentDefinitions}

export const ICON_COMPONENTS = {
${componentMapEntries}
} satisfies Record<IconName, IconComponent>;
`;
}
