import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Download, FileText, Folder } from 'lucide-react';

export default function SheetsImportStatus() {
  const [importStatus, setImportStatus] = useState({
    isImporting: false,
    lastImport: null,
    blogPosts: 0,
    projects: 0,
    errors: []
  });

  const [logs, setLogs] = useState([]);

  const handleImport = async () => {
    setImportStatus(prev => ({ ...prev, isImporting: true, errors: [] }));
    setLogs([]);

    try {
      // In a real implementation, this would call your import API endpoint
      // For now, we'll simulate the import process
      
      addLog('🔄 Starting import from Google Sheets...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('📝 Fetching blog posts...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addLog('🚀 Fetching projects...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('✅ Import completed successfully!');
      
      setImportStatus(prev => ({
        ...prev,
        isImporting: false,
        lastImport: new Date(),
        blogPosts: Math.floor(Math.random() * 10) + 1,
        projects: Math.floor(Math.random() * 5) + 1
      }));
      
    } catch (error) {
      addLog(`❌ Import failed: ${error.message}`);
      setImportStatus(prev => ({
        ...prev,
        isImporting: false,
        errors: [error.message]
      }));
    }
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            Google Sheets Import
          </h2>
          
          <button
            onClick={handleImport}
            disabled={importStatus.isImporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              importStatus.isImporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${importStatus.isImporting ? 'animate-spin' : ''}`} />
            {importStatus.isImporting ? 'Importing...' : 'Import Now'}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Blog Posts</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {importStatus.blogPosts}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Projects</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {importStatus.projects}
                </p>
              </div>
              <Folder className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Last Import</p>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {importStatus.lastImport 
                    ? importStatus.lastImport.toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Import Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Import Logs
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {importStatus.errors.length > 0 && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Import Errors
              </h3>
            </div>
            <ul className="space-y-1">
              {importStatus.errors.map((error, index) => (
                <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Setup Instructions
          </h3>
          <div className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
            <p><strong>1. Create your Google Sheet</strong> with the following structure:</p>
            <div className="ml-4 space-y-1">
              <p><strong>Blog Posts sheet:</strong> Title | Description | Content | Date | Tags | Image | ImageAlt | Status</p>
              <p><strong>Projects sheet:</strong> Title | Description | Href | Date | Status</p>
            </div>
            <p><strong>2. Set up environment variables:</strong></p>
            <div className="ml-4 space-y-1">
              <p>• <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">GOOGLE_SHEETS_SPREADSHEET_ID</code></p>
              <p>• <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">GOOGLE_SHEETS_API_KEY</code> (for public sheets)</p>
              <p>• Or service account credentials for private sheets</p>
            </div>
            <p><strong>3. Run the import:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">npm run import-sheets</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}