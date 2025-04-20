import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

import 'primereact/resources/themes/lara-light-blue/theme.css';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function App() {
  const editorRef = useRef<any>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await getDocument({ data: typedarray }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        let currentLine = '';
        let prevY: number | null = null;

        content.items.forEach((item: any) => {
          const text = item.str?.trim();
          if (!text) return;

          const y = item.transform[5]; // y ekseni
          if (prevY !== null && Math.abs(prevY - y) > 5) {
            fullText += `<p>${currentLine}</p>\n`;
            currentLine = '';
          }

          currentLine += `${text} `;
          prevY = y;
        });

        if (currentLine) {
          fullText += `<p>${currentLine}</p>\n`;
        }
      }

      console.log("✅ PDF'den gelen metin:", fullText);
      setTimeout(() => {
        editorRef.current?.setContent(fullText);
      }, 100);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleHighlight = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selectedText = editor.selection?.getContent({ format: 'html' });
    if (selectedText && selectedText.trim() !== '') {
      editor.selection.setContent(
        `<mark style="background-color: yellow">${selectedText}</mark>`
      );
    } else {
      alert("Lütfen önce editörde bir metin seçin.");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ marginBottom: '1rem' }}
      />

      <button onClick={handleHighlight} style={{ margin: '1rem 0' }}>
        Highlight et
      </button>

      <Editor
        apiKey="owque65ffjqqylihbku1yzcd978azu89pgg0yc6xy3yijvct"
        onInit={(_evt:any, editor:any) => {
          editorRef.current = editor;
        }}
        init={{
          height: 500,
          menubar: false,
          plugins: 'lists link',
          toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright | removeformat',
        }}
      />
    </div>
  );
}

export default App;