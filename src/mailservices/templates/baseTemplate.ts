interface BaseTemplateOptions {
    subject: string;
    content: string;
    appName?: string;
}

export function getBaseHtmlTemplate({
    subject,
    content,
    appName = "My App",
}: BaseTemplateOptions): string {
    return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8"><title>${subject}</title></head>
      <body style="font-family:Arial, sans-serif; background:#f7f7f7; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border:1px solid #ccc;">
          <h2 style="color:#345C72; text-align:center;">${appName}</h2>
          <p style="font-size:16px; line-height:1.6;">${content}</p>
          <p style="font-size:14px; color:#999; text-align:center; margin-top:40px;">
            &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
