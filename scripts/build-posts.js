// ./scripts/build-posts.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fse = require('fs-extra');

const VAULT_DIR = path.resolve(__dirname, '../Blog');
const BLOG_DIR = path.join(VAULT_DIR, 'posts');
const IMAGES_DIR = path.join(VAULT_DIR, 'images');
const OUTPUT_DIR = path.resolve(__dirname, '../site/content/post');

function slugify(fileName) {
  return fileName.replace(/\.md$/, '');
}

function buildPosts() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`);
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(rawContent);

    const slug = slugify(file);
    const postDir = path.join(OUTPUT_DIR, slug);

    // Ensure output directory exists
    fse.ensureDirSync(postDir);

    // Write the markdown content to index.md
    const outputMarkdownPath = path.join(postDir, 'index.md');
    fs.writeFileSync(outputMarkdownPath, matter.stringify(content, frontmatter), 'utf-8');

    // Copy the image if specified
    if (frontmatter.image) {
      const imageFileName = path.basename(frontmatter.image);
      const sourceImagePath = path.join(IMAGES_DIR, imageFileName);
      const destImagePath = path.join(postDir, imageFileName);

      if (fs.existsSync(sourceImagePath)) {
        fse.copyFileSync(sourceImagePath, destImagePath);
        console.log(`Copied image for ${file}: ${imageFileName}`);
      } else {
        console.warn(`Image file not found for ${file}: ${imageFileName}`);
      }
    }

    console.log(`Processed: ${file}`);
  });
}

buildPosts();
