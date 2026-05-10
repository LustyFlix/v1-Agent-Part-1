import { useState, useCallback } from 'react';
import { Code2, Globe, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { FileTree, type FileNode } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { PreviewPanel } from './components/PreviewPanel';
import type { Message } from './lib/supabase';

type WorkspaceTab = 'code' | 'preview';

const SAMPLE_FILES: FileNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gray-50 flex items-center justify-center">\n      <h1 className="text-2xl font-bold text-gray-800">Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
      },
      {
        name: 'index.css',
        path: 'src/index.css',
        type: 'file',
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
      },
    ],
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    content: `{\n  "name": "my-app",\n  "version": "0.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`,
  },
  {
    name: 'index.html',
    path: 'index.html',
    type: 'file',
    content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>My App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>`,
  },
];

function findFile(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

let msgIdCounter = 0;
function makeId() {
  return `local-${++msgIdCounter}-${Date.now()}`;
}

export default function App() {
  const [projectName, setProjectName] = useState('My Project');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewUrl] = useState<string | null>(null);

  const selectedFile = selectedPath ? findFile(files, selectedPath) : null;

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: makeId(),
        project_id: 'local',
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Placeholder response — Part 2 will wire real AI streaming
      setTimeout(() => {
        const assistantMsg: Message = {
          id: makeId(),
          project_id: 'local',
          role: 'assistant',
          content: `I'll help you with: "${content}"\n\nThe AI integration will be wired up in Part 2. For now, I've set up the full UI shell ready for streaming responses and file generation.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);

        // Seed example files on first message
        if (files.length === 0) {
          setFiles(SAMPLE_FILES);
          setSelectedPath('src/App.tsx');
        }
      }, 1200);
    },
    [files]
  );

  return (
    <div className="h-screen flex flex-col bg-[#0c0c0e] text-white overflow-hidden">
      <Header projectName={projectName} onRename={setProjectName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0f0f10]">
          <ChatPanel messages={messages} isLoading={isLoading} onSend={handleSend} />
        </div>

        {/* Workspace: file tree + editor/preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* File sidebar */}
          <div
            className={`flex flex-col border-r border-white/[0.06] bg-[#0f0f10] transition-all duration-200 overflow-hidden ${
              sidebarOpen ? 'w-52 shrink-0' : 'w-0'
            }`}
          >
            <FileTree
              files={files}
              selectedPath={selectedPath}
              onSelectFile={setSelectedPath}
            />
          </div>

          {/* Editor / Preview area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-3 h-9 border-b border-white/[0.06] bg-[#0f0f10] shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all mr-1"
              >
                {sidebarOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-white/[0.08] text-white/85'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <Code2 size={12} />
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white/[0.08] text-white/85'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <Globe size={12} />
                Preview
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewPanel previewUrl={previewUrl} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
