import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

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

        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += `<p>${pageText}</p>\n`;
      }

      console.log("✅ PDF'den gelen metin:", fullText);

      setTimeout(() => {
        if (editorRef.current) {
          console.log("🧪 editorRef mevcut, içerik ekleniyor");
          editorRef.current.setContent(fullText);
        } else {
          console.error("❌ editorRef boş!");
        }
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

      <button onClick={handleHighlight} style={{ marginBottom: '1rem' }}>
        Seçili Metni Vurgula
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
          toolbar:
            'undo redo | bold italic underline | alignleft aligncenter alignright | removeformat',
        }}
      />
    </div>
  );
}

export default App;