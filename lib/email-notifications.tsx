export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailNotificationService {
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // Using Supabase Edge Function for email sending
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("[v0] Email send failed:", error)
      return false
    }
  }

  // Template generators for common notifications
  taskAssignedEmail(taskTitle: string, assignedBy: string, dueDate: string): EmailTemplate {
    return {
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <h2>You have been assigned a new task</h2>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Assigned by:</strong> ${assignedBy}</p>
        <p><strong>Due date:</strong> ${dueDate}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks">View Task</a></p>
      `,
      text: `You have been assigned a new task: ${taskTitle}\nAssigned by: ${assignedBy}\nDue date: ${dueDate}`,
    }
  }

  permitExpiringEmail(permitType: string, expiryDate: string, siteName: string): EmailTemplate {
    return {
      subject: `Permit Expiring Soon: ${permitType}`,
      html: `
        <h2>Permit Expiring Soon</h2>
        <p><strong>Type:</strong> ${permitType}</p>
        <p><strong>Site:</strong> ${siteName}</p>
        <p><strong>Expires:</strong> ${expiryDate}</p>
        <p>Please ensure work is completed or extend the permit.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/permits">View Permits</a></p>
      `,
      text: `Permit expiring soon: ${permitType}\nSite: ${siteName}\nExpires: ${expiryDate}`,
    }
  }

  incidentReportedEmail(incidentType: string, severity: string, reportedBy: string): EmailTemplate {
    return {
      subject: `🚨 ${severity} Incident Reported: ${incidentType}`,
      html: `
        <h2 style="color: #dc2626;">Incident Reported</h2>
        <p><strong>Type:</strong> ${incidentType}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Reported by:</strong> ${reportedBy}</p>
        <p>Immediate action may be required.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/safety">View Incident</a></p>
      `,
      text: `Incident Reported: ${incidentType}\nSeverity: ${severity}\nReported by: ${reportedBy}`,
    }
  }

  inductionCompleteEmail(workerName: string, siteName: string): EmailTemplate {
    return {
      subject: `Induction Complete: ${workerName}`,
      html: `
        <h2>Site Induction Completed</h2>
        <p><strong>Worker:</strong> ${workerName}</p>
        <p><strong>Site:</strong> ${siteName}</p>
        <p>The worker is now authorized to access the site.</p>
      `,
      text: `Site induction completed for ${workerName} at ${siteName}`,
    }
  }
}

export const emailService = new EmailNotificationService()
