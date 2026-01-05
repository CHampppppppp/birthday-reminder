import nodemailer from 'nodemailer'

interface BirthdayReminderData {
  friendName: string
  birthday: Date
  daysUntil: number
  userName: string
  userEmail: string
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendBirthdayReminder(data: BirthdayReminderData): Promise<boolean> {
  try {
    const transporter = createTransporter()

    const { friendName, birthday, daysUntil, userName, userEmail } = data

    const subject = daysUntil === 0
      ? `🎂 Today is ${friendName}'s Birthday!`
      : `🎂 ${friendName}'s Birthday is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`

    const birthdayStr = birthday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Birthday Reminder</h1>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2c3e50; margin-top: 0;">
            ${daysUntil === 0 ? 'Today is' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until`} ${friendName}'s Birthday!
          </h2>

          <p style="font-size: 16px; color: #555;">
            <strong>Birthday:</strong> ${birthdayStr}
          </p>

          <p style="font-size: 16px; color: #555;">
            Don't forget to wish ${friendName} a happy birthday!
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #777; font-size: 14px;">
            Sent with ❤️ from Birthday Reminder
          </p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email connection test failed:', error)
    return false
  }
}
