import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Generate only known local images. Uploaded and external URLs keep working
// unchanged. Hashed variants can live in the browser cache across deployments.
export default function responsiveImages() {
  const id = '\0virtual:responsive-images';
  let config;
  let images = {};
  return {
    name: 'responsive-images',
    configResolved(value) { config = value; },
    resolveId(source) {
      if (source === 'virtual:responsive-images') return id;
    },
    load(source) {
      if (source === id) return `export default ${JSON.stringify(images)};`;
    },
    async buildStart() {
      images = {};
      if (config.command !== 'build') return;
      const directory = path.join(config.publicDir, 'images');
      for (const name of (await readdir(directory)).sort()) {
        if (!/\.(webp|jpe?g|png)$/i.test(name)) continue;
        const source = await readFile(path.join(directory, name));
        const metadata = await sharp(source).metadata();
        if (!metadata.width || metadata.pages > 1) continue;
        const widths = [...new Set([400, 640, 900, 1200, 1600, metadata.width])]
          .filter((width) => width <= metadata.width).sort((a, b) => a - b);
        const candidates = [];
        for (const width of widths) {
          const output = await sharp(source).resize({ width, withoutEnlargement: true })
            .webp({ quality: 78 }).toBuffer();
          if (output.length >= source.length) continue;
          const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
          const fileName = `assets/images/${path.parse(name).name}-${width}-${hash}.webp`;
          this.emitFile({ type: 'asset', fileName, source: output });
          candidates.push(`/${fileName} ${width}w`);
        }
        if (!candidates.some((candidate) => candidate.endsWith(` ${metadata.width}w`))) {
          candidates.push(`/images/${name} ${metadata.width}w`);
        }
        images[`/images/${name}`] = candidates.join(', ');
      }
    },
  };
}
