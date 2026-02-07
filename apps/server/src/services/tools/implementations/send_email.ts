import { ToolResult, ToolLog } from '@opsuna/shared';

export async function sendEmail(
  callId: string,
  params: { to: string; subject: string; body: string; cc?: string },
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const startTime = Date.now();
  const logs: ToolLog[] = [];

  const addLog = (level: ToolLog['level'], message: string) => {
    const log: ToolLog = { timestamp: new Date(), level, message };
    logs.push(log);
    onLog(log);
  };

  try {
    addLog('info', `Preparing email to ${params.to}`);

    await delay(300);
    addLog('info', `Subject: ${params.subject}`);

    await delay(200);
    addLog('info', 'Validating email addresses...');

    await delay(400);
    addLog('info', 'Connecting to SMTP server...');

    await delay(500);
    addLog('info', 'Sending email...');

    await delay(300);
    addLog('info', `Email sent successfully to ${params.to}`);

    return {
      callId,
      toolName: 'send_email',
      success: true,
      data: {
        messageId: `msg-${Date.now()}`,
        to: params.to,
        cc: params.cc || null,
        subject: params.subject,
        sentAt: new Date().toISOString(),
        status: 'delivered',
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to send email: ${error}`);
    return {
      callId,
      toolName: 'send_email',
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: String(error),
        recoverable: true,
      },
      duration: Date.now() - startTime,
      logs,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
