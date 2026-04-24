import { PrismaClient, Industry } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#AED6F1', '#FAD7A0', '#A9CCE3',
];

const NAME_POOL = [
  'Tunde', 'Chidi', 'Amaka', 'Kemi', 'Seun',
  'Bayo', 'Ngozi', 'Emeka', 'Fatima', 'Yemi',
  'Dare', 'Uche', 'Sola', 'Tobi', 'Ada',
  'Remi', 'Femi', 'Nkem', 'Kunle', 'Chioma',
];

function identity(index: number) {
  const username = NAME_POOL[index % NAME_POOL.length];
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return { username, avatar: username[0], avatarColor };
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  await prisma.reaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.organization.deleteMany();

  const orgs = await Promise.all([
    prisma.organization.create({ data: { name: 'Flutterwave', industry: Industry.TECH } }),
    prisma.organization.create({ data: { name: 'Access Bank', industry: Industry.FINANCE } }),
    prisma.organization.create({ data: { name: 'MTN Nigeria', industry: Industry.TECH } }),
    prisma.organization.create({ data: { name: 'Jumia Nigeria', industry: Industry.RETAIL } }),
    prisma.organization.create({ data: { name: 'Andela', industry: Industry.TECH } }),
    prisma.organization.create({ data: { name: 'NNPC Group', industry: Industry.ENERGY } }),
    prisma.organization.create({ data: { name: 'Kuda Bank', industry: Industry.FINANCE } }),
    prisma.organization.create({ data: { name: 'Paystack', industry: Industry.TECH } }),
    prisma.organization.create({ data: { name: 'Sterling Bank', industry: Industry.FINANCE } }),
    prisma.organization.create({ data: { name: 'Channels TV', industry: Industry.MEDIA } }),
    prisma.organization.create({ data: { name: 'Lagos State Government', industry: Industry.GOVERNMENT } }),
    prisma.organization.create({ data: { name: 'Covenant University', industry: Industry.EDUCATION } }),
  ]);

  const [flutterwave, accessBank, mtn, jumia, andela, nnpc, kuda, paystack, sterling, channels, lasg, cu] = orgs;

  const reviews = [
    // Flutterwave
    { orgId: flutterwave.id, ...identity(0), rating: 2, heading: 'Constant downtime during peak hours', body: 'Payments fail at the worst possible times. Monthly salary payments always cause a crisis — the system buckles exactly when it matters most. This has cost us clients.', emoji: '😤', likes: 34, dislikes: 4, createdAt: daysAgo(25) },
    { orgId: flutterwave.id, ...identity(1), rating: 4, heading: 'Great product, frustrating support', body: 'The API is genuinely impressive and well-documented. But the moment something breaks, getting a human on the line takes days. The product deserves better support infrastructure.', likes: 18, dislikes: 2, createdAt: daysAgo(18) },
    { orgId: flutterwave.id, ...identity(2), rating: 3, heading: 'Fees are quietly creeping up', body: 'Love that they are building African fintech but the transaction fees have quietly increased twice this year with zero communication. At least tell us before you do it.', emoji: '💸', likes: 22, dislikes: 3, createdAt: daysAgo(12) },
    { orgId: flutterwave.id, ...identity(3), rating: 5, heading: 'Best payment infrastructure in Africa', body: 'After trying every alternative, I keep coming back. Settlement is fast, the dashboard is clean, and the multi-currency support is unmatched anywhere on the continent.', emoji: '🔥', likes: 41, dislikes: 1, createdAt: daysAgo(5) },

    // Access Bank
    { orgId: accessBank.id, ...identity(4), rating: 3, heading: 'Average experience, nothing special', body: 'The mobile app crashes regularly and customer service puts you on hold forever. Not terrible but not worth the branding they throw at you.', likes: 9, dislikes: 2, createdAt: daysAgo(30) },
    { orgId: accessBank.id, ...identity(5), rating: 2, heading: 'Endless queues and broken ATMs', body: 'Visited three branches this week. Every single ATM was out of service at at least one of them. The queue inside was one hour long. In 2024.', emoji: '😩', likes: 47, dislikes: 5, createdAt: daysAgo(20) },
    { orgId: accessBank.id, ...identity(6), rating: 1, heading: 'Unauthorized charges with zero accountability', body: 'Noticed three charges I did not authorize. Reported them and was told to fill a form, wait two weeks, then visit the branch again. The money is still missing.', emoji: '🚨', likes: 63, dislikes: 3, createdAt: daysAgo(10) },
    { orgId: accessBank.id, ...identity(7), rating: 4, heading: 'Diamond Plus members get treated right', body: 'Since upgrading to premium tier the experience has been significantly better. Dedicated line, faster resolutions, proper relationship manager. Just wish it was standard for everyone.', likes: 11, dislikes: 6, createdAt: daysAgo(3) },

    // MTN Nigeria
    { orgId: mtn.id, ...identity(8), rating: 2, heading: '4G speeds that feel like EDGE', body: 'Paying for a 4G data plan but the speeds are embarrassing. 1.2 Mbps on a good day in Lagos Island. The infrastructure investment clearly is not keeping up with subscriber growth.', emoji: '📶', likes: 38, dislikes: 4, createdAt: daysAgo(40) },
    { orgId: mtn.id, ...identity(9), rating: 3, heading: 'Decent coverage but overpriced', body: 'You cannot argue with the network coverage — even in my village in Imo State I get signal. But the data pricing has become a joke compared to what other African markets pay.', likes: 16, dislikes: 5, createdAt: daysAgo(22) },
    { orgId: mtn.id, ...identity(10), rating: 1, heading: 'Data expires before I use it', body: 'Bought 10GB last Monday. By Thursday it was gone and I had not streamed anything or done video calls. Something is wrong with their data tracking and they just blame the customer.', emoji: '😡', likes: 55, dislikes: 2, createdAt: daysAgo(8) },

    // Jumia Nigeria
    { orgId: jumia.id, ...identity(11), rating: 3, heading: 'Hit or miss depending on the seller', body: 'When you find a reliable seller on Jumia it is great. But with no proper seller vetting you are basically gambling. Returns work maybe 50 percent of the time.', likes: 14, dislikes: 4, createdAt: daysAgo(15) },
    { orgId: jumia.id, ...identity(12), rating: 4, heading: 'JumiaPay refund actually worked', body: 'Had a bad experience with a seller. Used JumiaPay and the refund process was smoother than expected — credit back in three days. That alone earns this rating.', emoji: '✅', likes: 19, dislikes: 1, createdAt: daysAgo(6) },

    // Andela
    { orgId: andela.id, ...identity(13), rating: 4, heading: 'Transformed my career trajectory', body: 'The training and global network access Andela provided genuinely changed my life. I am now working remotely for a US company at a rate I never thought possible from Nigeria.', emoji: '🚀', likes: 29, dislikes: 2, createdAt: daysAgo(35) },
    { orgId: andela.id, ...identity(14), rating: 5, heading: 'Best developer community in Africa', body: 'The peer learning environment is unmatched. The engineers you meet here push you in ways no bootcamp or university program has. Alumni network is genuinely powerful.', emoji: '💪', likes: 36, dislikes: 0, createdAt: daysAgo(20) },
    { orgId: andela.id, ...identity(15), rating: 3, heading: 'Placement timelines have slipped badly', body: 'Great program but they are experiencing scale issues. Time from cohort completion to client placement has stretched to six plus months for some people. The waiting is brutal.', likes: 21, dislikes: 3, createdAt: daysAgo(7) },

    // NNPC
    { orgId: nnpc.id, ...identity(16), rating: 1, heading: 'Fuel scarcity feels manufactured', body: 'Three months of shortage while refineries are supposedly running and the country is an oil producer. The opacity around supply chain decisions is infuriating and insulting.', emoji: '⛽', likes: 91, dislikes: 7, createdAt: daysAgo(50) },
    { orgId: nnpc.id, ...identity(17), rating: 2, heading: 'Subsidy removal without real alternatives', body: 'Removing subsidies could make sense if the savings were visibly reinvested in public transport. Instead prices tripled and nothing improved. People are suffering for this.', emoji: '😔', likes: 67, dislikes: 5, createdAt: daysAgo(28) },

    // Kuda Bank
    { orgId: kuda.id, ...identity(18), rating: 5, heading: 'Zero fees changed how I think about banking', body: 'I have saved more in banking fees with Kuda than I did in the previous five years combined across three legacy banks. This is what banking should have always looked like.', emoji: '💚', likes: 48, dislikes: 1, createdAt: daysAgo(14) },
    { orgId: kuda.id, ...identity(19), rating: 4, heading: 'Support actually responds at midnight', body: 'Had a locked card situation at 11pm. Sent a message on the app and got a response in eight minutes with the fix. That would have taken a week at my old bank.', emoji: '🌙', likes: 33, dislikes: 0, createdAt: daysAgo(9) },
    { orgId: kuda.id, ...identity(0), rating: 3, heading: 'Growing pains are showing', body: 'Love the vision but system downtime has become a weekly occurrence. When challenger banks start having the same reliability issues as legacy banks something is wrong.', likes: 17, dislikes: 4, createdAt: daysAgo(4) },

    // Paystack
    { orgId: paystack.id, ...identity(1), rating: 5, heading: 'Gold standard for Nigerian payments', body: 'Running an e-commerce store for four years. Paystack has been the most reliable piece of our entire stack. Settlement is consistent, disputes get resolved, dashboard never lies.', emoji: '🏆', likes: 52, dislikes: 0, createdAt: daysAgo(30) },
    { orgId: paystack.id, ...identity(2), rating: 4, heading: 'The analytics dashboard alone is worth it', body: 'The insights you get from the Paystack dashboard are better than what most paid analytics tools give you. Revenue trends, peak transaction times, customer return rate. Beautifully done.', likes: 24, dislikes: 1, createdAt: daysAgo(11) },

    // Sterling Bank
    { orgId: sterling.id, ...identity(3), rating: 2, heading: 'Branch staff need proper retraining', body: 'Visited the VI branch and the tellers were dismissive when I asked a basic question about my account. The culture needs serious work from the top down.', likes: 12, dislikes: 3, createdAt: daysAgo(17) },
    { orgId: sterling.id, ...identity(4), rating: 3, heading: 'OneBank app is actually underrated', body: 'The Sterling OneBank app is better than most competitors give it credit for. Clean UI, quick transfers, decent UX. The problem is the offline branch experience ruins the overall impression.', likes: 8, dislikes: 2, createdAt: daysAgo(9) },

    // Channels TV
    { orgId: channels.id, ...identity(5), rating: 3, heading: 'Editorial balance has slipped', body: 'Used to be the gold standard for Nigerian news. In the last two years the editorial balance has become questionable and certain stories get underreported in ways that are hard to ignore.', likes: 20, dislikes: 8, createdAt: daysAgo(21) },
    { orgId: channels.id, ...identity(6), rating: 2, heading: 'Sensationalism over substance now', body: 'Breaking news banners for non-breaking events. The graphic design changes every year but the actual journalism quality is declining. We deserve better public affairs coverage.', emoji: '📺', likes: 25, dislikes: 6, createdAt: daysAgo(13) },

    // Lagos State Government
    { orgId: lasg.id, ...identity(7), rating: 1, heading: 'Infrastructure projects never get finished', body: 'The Lekki-Epe expressway has been under construction for how many years exactly. Contractors get paid, roads stay broken, contracts get re-awarded. The cycle never ends.', emoji: '🚧', likes: 84, dislikes: 9, createdAt: daysAgo(45) },

    // Covenant University
    { orgId: cu.id, ...identity(8), rating: 4, heading: 'Discipline is real and results follow', body: 'The strict environment is not for everyone but I came out more focused and employable than most of my peers. The no-phone policy felt extreme but the deep work habits it built were worth it.', likes: 15, dislikes: 7, createdAt: daysAgo(60) },
    { orgId: cu.id, ...identity(9), rating: 3, heading: 'Fees do not match current facilities', body: 'The academic program is decent but the fees have outpaced what is actually on campus. Other private universities are offering better lab equipment and accommodation at lower cost now.', likes: 11, dislikes: 3, createdAt: daysAgo(33) },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }

  console.log(`Seeded ${orgs.length} organizations and ${reviews.length} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
