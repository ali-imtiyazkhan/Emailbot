import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@emailbot.io' },
    update: {},
    create: {
      email: 'admin@emailbot.io',
      name: 'Admin User',
      whatsapp: '+1234567890',
    },
  });

  console.log(`  ✓ User created: ${user.email} (id: ${user.id})`);

  // Create a Gmail account
  const gmailAccount = await prisma.emailAccount.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      provider: 'gmail',
      email: 'admin@gmail.com',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiry: new Date(Date.now() + 3600000),
      isActive: true,
    },
  });

  console.log(`  ✓ Gmail account created: ${gmailAccount.email}`);

  // Create sample filter rules
  const rules = [
    { ruleType: 'sender', value: 'ceo@company.com' },
    { ruleType: 'keyword', value: 'URGENT' },
    { ruleType: 'priority_min', value: '7' },
  ];

  for (const rule of rules) {
    await prisma.filterRule.create({
      data: { userId: user.id, ...rule },
    });
  }

  console.log(`  ✓ ${rules.length} filter rules created`);

  // Create sample processed emails
  const sampleEmails = [
    {
      subject: 'Q4 Revenue Report — Action Required',
      sender: 'cfo@company.com',
      summary: 'CFO requests review of Q4 revenue figures before board meeting. Revenue up 12% YoY, but APAC region underperforming.',
      priorityScore: 9,
      notified: true,
    },
    {
      subject: 'Team Standup Notes — March 27',
      sender: 'pm@company.com',
      summary: 'Sprint retrospective scheduled for Friday. 3 blockers identified in the email processing pipeline.',
      priorityScore: 5,
      notified: false,
    },
    {
      subject: 'Your Weekly Newsletter',
      sender: 'newsletter@techdigest.com',
      summary: 'Weekly roundup of top tech news including AI advancements and cloud computing trends.',
      priorityScore: 2,
      notified: false,
      digestIncluded: true,
    },
    {
      subject: 'Security Alert: New Login Detected',
      sender: 'security@google.com',
      summary: 'A new sign-in to your Google account was detected from Windows device in New York.',
      priorityScore: 8,
      notified: true,
    },
    {
      subject: 'Invoice #4521 — Payment Due',
      sender: 'billing@cloudservice.io',
      summary: 'Monthly cloud infrastructure invoice for $2,340. Payment due by April 5th.',
      priorityScore: 6,
      notified: true,
    },
  ];

  for (let i = 0; i < sampleEmails.length; i++) {
    await prisma.processedEmail.create({
      data: {
        userId: user.id,
        emailAccountId: gmailAccount.id,
        messageId: `seed-email-${i + 1}`,
        ...sampleEmails[i],
        receivedAt: new Date(Date.now() - (i * 3600000)),
        processedAt: new Date(Date.now() - (i * 3600000) + 30000),
      },
    });
  }

  console.log(`  ✓ ${sampleEmails.length} sample emails created`);

  // Create digest settings
  await prisma.digestSetting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      enabled: true,
      sendTime: '08:00',
      timezone: 'UTC',
      minEmails: 1,
    },
  });

  console.log('  ✓ Digest settings configured');
  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
