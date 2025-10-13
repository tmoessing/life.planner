# Google Sheets Integration Setup

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
```

## Getting Your Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins"
   - Copy the Client ID

## Security Notes

- **Client ID is safe to expose** - OAuth Client IDs are public identifiers
- **Never expose Client Secret** - Only use Client ID for client-side apps
- **Rate limiting** - Consider setting up quotas to prevent abuse
- **Environment variables** - Use `.env` file and add it to `.gitignore`

## Usage

1. Set up your environment variables
2. Start the application
3. Go to Settings > Google Sheets
4. Enter your Google Sheets URL
5. Click "Connect to Google"
6. Authorize the application
7. Your data will sync automatically!

## Troubleshooting

- **Authentication fails**: Check your Client ID and authorized origins
- **Sync errors**: Ensure the Google Sheets API is enabled
- **Permission denied**: Make sure you have edit access to the sheet
- **Rate limits**: Check your Google Cloud Console quotas
