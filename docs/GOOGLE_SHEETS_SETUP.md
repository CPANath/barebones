# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for your Astro blog, allowing you to manage your blog posts and projects directly from Google Sheets.

## 1. Google Sheets Structure

### Blog Posts Sheet
Create a sheet named "Blog Posts" with these columns:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| Title | Post title | Yes | "My First Blog Post" |
| Description | Post description/excerpt | Yes | "This is my first blog post about..." |
| Content | Full post content (Markdown supported) | Yes | "# Hello World\n\nThis is my content..." |
| Date | Publication date | No | "2024-01-15" or "1/15/2024" |
| Tags | Comma-separated tags | No | "javascript, web development, tutorial" |
| Image | Image URL or path | No | "https://example.com/image.jpg" |
| ImageAlt | Alt text for image | No | "Screenshot of the application" |
| Status | Publication status | Yes | "published" or "draft" |

### Projects Sheet
Create a sheet named "Projects" with these columns:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| Title | Project title | Yes | "My Awesome Project" |
| Description | Project description | Yes | "A web application that does..." |
| Href | Project URL | Yes | "https://myproject.com" |
| Date | Project date | No | "2024-01-15" |
| Status | Publication status | Yes | "published" or "draft" |

## 2. Google API Setup

### Option A: Public Sheets (API Key)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials → API Key
5. Make your Google Sheet public (Share → Anyone with the link can view)

### Option B: Private Sheets (Service Account)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials → Service Account
5. Download the JSON key file
6. Share your Google Sheet with the service account email

## 3. Environment Variables

Create a `.env` file in your project root:

```env
# Required: Your Google Sheets spreadsheet ID
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Option A: For public sheets
GOOGLE_SHEETS_API_KEY=your_api_key_here

# Option B: For private sheets (service account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
```

### Finding Your Spreadsheet ID
The spreadsheet ID is in the URL of your Google Sheet:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This is your spreadsheet ID
```

## 4. Running the Import

### Manual Import
Run the import script manually:
```bash
npm run import-sheets
```

### Automated Import
You can set up automated imports using:
- GitHub Actions (on push/schedule)
- Netlify Build Hooks
- Vercel Cron Jobs
- Or any CI/CD pipeline

Example GitHub Action (`.github/workflows/import-sheets.yml`):
```yaml
name: Import from Google Sheets
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch: # Manual trigger

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run import-sheets
        env:
          GOOGLE_SHEETS_SPREADSHEET_ID: ${{ secrets.GOOGLE_SHEETS_SPREADSHEET_ID }}
          GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Update content from Google Sheets" || exit 0
          git push
```

## 5. Content Guidelines

### Writing in Google Sheets
- **Markdown Support**: You can use Markdown in the Content column
- **Line Breaks**: Use `\n` for line breaks in cells
- **Images**: Use full URLs for images or relative paths
- **Tags**: Separate multiple tags with commas
- **Status**: Only items with status "published" will be imported

### Best Practices
1. **Keep it Simple**: Don't use complex formatting in sheet cells
2. **Test First**: Use "draft" status to test content before publishing
3. **Backup**: Keep backups of your sheets
4. **Validation**: Check the import logs for any errors
5. **SEO**: Write good descriptions for better SEO

## 6. Troubleshooting

### Common Issues

**"Spreadsheet not found"**
- Check your spreadsheet ID
- Ensure the sheet is public (for API key) or shared with service account

**"API key invalid"**
- Verify your API key is correct
- Check that Google Sheets API is enabled

**"Permission denied"**
- For service accounts: ensure the sheet is shared with the service account email
- For API keys: ensure the sheet is public

**"No data imported"**
- Check that your sheet names match exactly ("Blog Posts", "Projects")
- Ensure you have "published" in the Status column
- Verify required fields are filled

### Debug Mode
Add debug logging to the import script by setting:
```env
DEBUG=true
```

## 7. Advanced Features

### Custom Sheet Names
Modify the `SHEET_RANGES` in `scripts/import-from-sheets.js` to use different sheet names.

### Additional Content Types
Extend the system by:
1. Adding new sheet ranges
2. Creating new import functions
3. Adding corresponding content collections in Astro

### Webhook Integration
Set up webhooks to trigger imports when sheets are updated:
1. Use Google Apps Script to create a webhook
2. Set up an API endpoint in your app
3. Trigger the import script via the webhook

This setup gives you a powerful content management system using Google Sheets as your CMS!