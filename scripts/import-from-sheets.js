import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Sheet ranges for different content types
const SHEET_RANGES = {
  blog: 'Blog Posts!A:H', // A=title, B=description, C=content, D=date, E=tags, F=image, G=imageAlt, H=status
  projects: 'Projects!A:E', // A=title, B=description, C=href, D=date, E=status
};

class SheetsImporter {
  constructor() {
    this.sheets = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      let auth;
      
      if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
        // Use service account for private sheets
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: SERVICE_ACCOUNT_EMAIL,
            private_key: PRIVATE_KEY,
          },
          scopes: ['https://www.googleapis.com/spreadsheets/readonly'],
        });
      } else if (API_KEY) {
        // Use API key for public sheets
        auth = API_KEY;
      } else {
        throw new Error('No authentication method provided. Set either API_KEY or service account credentials.');
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets API initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error.message);
      process.exit(1);
    }
  }

  async fetchSheetData(range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`❌ Error fetching data from range ${range}:`, error.message);
      return [];
    }
  }

  parseRowData(headers, row) {
    const data = {};
    headers.forEach((header, index) => {
      data[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
    });
    return data;
  }

  async importBlogPosts() {
    console.log('📝 Importing blog posts...');
    
    const data = await this.fetchSheetData(SHEET_RANGES.blog);
    if (data.length === 0) {
      console.log('⚠️  No blog post data found');
      return;
    }

    const headers = data[0];
    const rows = data.slice(1);
    let imported = 0;

    for (const row of rows) {
      const post = this.parseRowData(headers, row);
      
      // Skip if status is not 'published' or if required fields are missing
      if (post.status?.toLowerCase() !== 'published' || !post.title || !post.content) {
        continue;
      }

      try {
        await this.createBlogPost(post);
        imported++;
        console.log(`✅ Imported: ${post.title}`);
      } catch (error) {
        console.error(`❌ Failed to import ${post.title}:`, error.message);
      }
    }

    console.log(`📝 Imported ${imported} blog posts`);
  }

  async createBlogPost(post) {
    // Create a URL-friendly slug from the title
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create the blog post directory
    const postDir = path.join('src', 'content', 'blog', slug);
    await fs.mkdir(postDir, { recursive: true });

    // Parse the publication date
    let publicationDate;
    try {
      publicationDate = post.date ? new Date(post.date) : new Date();
    } catch {
      publicationDate = new Date();
    }

    // Parse tags
    const tags = post.tags 
      ? post.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // Create frontmatter
    const frontmatter = {
      title: post.title,
      description: post.description || '',
      publicationDate: publicationDate.toISOString(),
      ...(post.image && { image: post.image }),
      ...(post.image_alt && { imageAlt: post.image_alt }),
      ...(tags.length > 0 && { tags }),
    };

    // Create the markdown content
    const markdownContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
    }
    if (value instanceof Date || key === 'publicationDate') {
      return `${key}: ${value}`;
    }
    return `${key}: "${value}"`;
  })
  .join('\n')}
---

${post.content}
`;

    // Write the markdown file
    const filePath = path.join(postDir, 'index.md');
    await fs.writeFile(filePath, markdownContent, 'utf8');
  }

  async importProjects() {
    console.log('🚀 Importing projects...');
    
    const data = await this.fetchSheetData(SHEET_RANGES.projects);
    if (data.length === 0) {
      console.log('⚠️  No project data found');
      return;
    }

    const headers = data[0];
    const rows = data.slice(1);
    let imported = 0;

    for (const row of rows) {
      const project = this.parseRowData(headers, row);
      
      // Skip if status is not 'published' or if required fields are missing
      if (project.status?.toLowerCase() !== 'published' || !project.title || !project.href) {
        continue;
      }

      try {
        await this.createProject(project);
        imported++;
        console.log(`✅ Imported: ${project.title}`);
      } catch (error) {
        console.error(`❌ Failed to import ${project.title}:`, error.message);
      }
    }

    console.log(`🚀 Imported ${imported} projects`);
  }

  async createProject(project) {
    // Create a URL-friendly slug from the title
    const slug = project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create the project directory
    const projectDir = path.join('src', 'content', 'projects', slug);
    await fs.mkdir(projectDir, { recursive: true });

    // Parse the publication date
    let publicationDate;
    try {
      publicationDate = project.date ? new Date(project.date) : new Date();
    } catch {
      publicationDate = new Date();
    }

    // Create frontmatter
    const frontmatter = {
      title: project.title,
      description: project.description || '',
      href: project.href,
      ...(project.date && { publicationDate: publicationDate.toISOString() }),
    };

    // Create the markdown content
    const markdownContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: "${value}"`)
  .join('\n')}
---

`;

    // Write the markdown file
    const filePath = path.join(projectDir, 'index.md');
    await fs.writeFile(filePath, markdownContent, 'utf8');
  }

  async run() {
    console.log('🔄 Starting Google Sheets import...');
    
    if (!SPREADSHEET_ID) {
      console.error('❌ GOOGLE_SHEETS_SPREADSHEET_ID is required');
      process.exit(1);
    }

    await this.importBlogPosts();
    await this.importProjects();
    
    console.log('✅ Import completed successfully!');
  }
}

// Run the importer
const importer = new SheetsImporter();
importer.run().catch(console.error);