// ./scripts/build-posts.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fse = require('fs-extra');

const VAULT_DIR = path.resolve(__dirname, '../Blog');
const BLOG_DIR = path.join(VAULT_DIR, '1 - Posts');
const IMAGES_DIR = path.join(VAULT_DIR, '4 - Images');
const OUTPUT_DIR = path.resolve(__dirname, '../site/content/post');
const IMAGE_OUTPUT_DIR = path.resolve(__dirname, '../site/assets/img');

function slugify(fileName) {
  return fileName.replace(/\.md$/, '');
}

function fixImages(fileName) {
  return fileName.replace("](</4 - Images/", '](</assets/img/');
}

function copyImageToDir(filename, destDir) {
  const imageFileName = path.basename(filename);
  const sourceImagePath = path.join(IMAGES_DIR, imageFileName);
  const destImagePath = path.join(destDir, imageFileName);

  if (fs.existsSync(sourceImagePath)) {
    fse.copyFileSync(sourceImagePath, destImagePath);
    console.log(`Copied image for ${filename}: ${imageFileName}`);
  } else {
    console.warn(`Image file not found for ${filename}: ${imageFileName}`);
  }
}

function buildPosts() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`);
    return;
  }

  const images = fs.readdirSync(IMAGES_DIR);
  images.forEach(image => {
    copyImageToDir(image, IMAGE_OUTPUT_DIR);
  });

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: initialContent } = matter(rawContent);

    const slug = slugify(file);
    const postDir = path.join(OUTPUT_DIR, slug);

    const content = fixImages(initialContent);

    // Ensure output directory exists
    fse.ensureDirSync(postDir);

    // Write the markdown content to index.md
    const outputMarkdownPath = path.join(postDir, 'index.md');
    fs.writeFileSync(outputMarkdownPath, matter.stringify(content, frontmatter), 'utf-8');

    // Copy the image if specified
    if (frontmatter.image) {
      copyImageToDir(frontmatter.image, postDir);
    }

    console.log(`Processed: ${file}`);
  });
}

buildPosts();
