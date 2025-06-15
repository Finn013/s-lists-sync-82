
export class ExportManager {
  static exportToTXT(data: any[], filename: string): void {
    let content = '';
    
    data.forEach((item, index) => {
      if (item.type === 'separator') {
        content += `\n--- ${item.separatorText || `Разделитель ${item.separatorLevel} уровня`} ---\n\n`;
      } else {
        content += `${index + 1}. ${item.columns.join(' | ')}\n`;
        if (item.issuedTo) {
          content += `   Выдано: ${item.issuedTo} (${item.issuedDate})\n`;
        }
        if (item.returnedDate) {
          content += `   Возвращено: ${item.returnedDate}\n`;
        }
        content += '\n';
      }
    });

    this.downloadFile(content, filename, 'text/plain');
  }

  static exportToHTML(data: any[], filename: string): void {
    let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Экспорт из S-</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .separator { background: #f0f0f0; padding: 10px; margin: 15px 0; border-left: 4px solid #007bff; }
        .item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .item-info { color: #666; font-size: 0.9em; margin-top: 5px; }
        .columns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .column { padding: 5px; border: 1px solid #eee; }
    </style>
</head>
<body>
    <h1>Экспорт из S-</h1>
    <div class="content">
`;

    data.forEach((item, index) => {
      if (item.type === 'separator') {
        html += `<div class="separator"><strong>${item.separatorText || `Разделитель ${item.separatorLevel} уровня`}</strong></div>`;
      } else {
        html += `<div class="item">`;
        html += `<div class="columns">`;
        item.columns.forEach((col: string) => {
          html += `<div class="column">${col || '&nbsp;'}</div>`;
        });
        html += `</div>`;
        
        if (item.issuedTo || item.returnedDate) {
          html += `<div class="item-info">`;
          if (item.issuedTo) {
            html += `Выдано: ${item.issuedTo} (${item.issuedDate})`;
          }
          if (item.returnedDate) {
            html += ` | Возвращено: ${item.returnedDate}`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      }
    });

    html += `
    </div>
    <footer style="margin-top: 30px; color: #666; font-size: 0.8em;">
        Экспортировано из приложения S- - ${new Date().toLocaleString('ru-RU')}
    </footer>
</body>
</html>`;

    this.downloadFile(html, filename, 'text/html');
  }

  static async exportToPNG(element: HTMLElement, filename: string): Promise<void> {
    // This would require html2canvas library
    // For now, we'll create a simple implementation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.fillText('Экспорт из S-', 20, 40);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
