import { google } from 'googleapis';

interface SheetRow {
  [key: string]: string;
}

interface BlogPostData {
  title: string;
  description: string;
  content: string;
  date: string;
  tags: string;
  image?: string;
  imageAlt?: string;
  status: string;
}

interface ProjectData {
  title: string;
  description: string;
  href: string;
  date?: string;
  status: string;
}

export class GoogleSheetsClient {
  private sheets: any;
  private spreadsheetId: string;

  constructor(spreadsheetId: string, apiKey?: string, serviceAccount?: any) {
    this.spreadsheetId = spreadsheetId;
    
    let auth;
    if (serviceAccount) {
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/spreadsheets/readonly'],
      });
    } else if (apiKey) {
      auth = apiKey;
    } else {
      throw new Error('Either API key or service account credentials are required');
    }

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async fetchRange(range: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Error fetching range ${range}:`, error);
      return [];
    }
  }

  parseRows<T>(data: string[][]): T[] {
    if (data.length === 0) return [];
    
    const headers = data[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const rows = data.slice(1);
    
    return rows.map(row => {
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = row[index] || '';
      });
      return item as T;
    });
  }

  async getBlogPosts(): Promise<BlogPostData[]> {
    const data = await this.fetchRange('Blog Posts!A:H');
    return this.parseRows<BlogPostData>(data)
      .filter(post => post.status?.toLowerCase() === 'published' && post.title && post.content);
  }

  async getProjects(): Promise<ProjectData[]> {
    const data = await this.fetchRange('Projects!A:E');
    return this.parseRows<ProjectData>(data)
      .filter(project => project.status?.toLowerCase() === 'published' && project.title && project.href);
  }
}

// Utility function to create a slug from a title
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Utility function to parse tags
export function parseTags(tagString: string): string[] {
  return tagString 
    ? tagString.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];
}