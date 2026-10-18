import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';

type DocKey = 'terms' | 'privacy' | 'guidelines';
type Doc = { title: string; updated: string; sections: { h: string; body: string }[] };

// ponytail: static in-app copy — swap for remote/CMS-hosted docs when legal finalizes them.
const DOCS: Record<DocKey, Doc> = {
  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: March 2027',
    sections: [
      {
        h: '1. Who can use Tara Bucket',
        body: 'You must be at least 18 years old to create an account. We verify age and identity through our verification partner before you can host or join meetups. Accounts found to belong to minors are removed immediately.',
      },
      {
        h: '2. Your account',
        body: 'Keep your details accurate and your login to yourself — one account per person, under your real identity. You are responsible for activity on your account. We may suspend accounts that break these terms or the Community Guidelines.',
      },
      {
        h: '3. Meetups and plans',
        body: 'Tara Bucket helps people organize real-world meetups, but hosts and attendees are not our employees or agents. You join meetups at your own discretion — read the plan, know the venue, and follow local laws and venue rules.',
      },
      {
        h: '4. Payments and Premium',
        body: 'Premium is a monthly subscription (₱149/mo) that renews automatically until you cancel through your app store. KKB cost-splitting is a convenience between members; Tara Bucket does not hold or transfer funds.',
      },
      {
        h: '5. Your content',
        body: 'You own what you post — buckets, plans, photos, notes. By posting, you give us a license to display that content inside the app so plans and feeds work. Do not post content that is illegal, misleading, or infringes on others.',
      },
      {
        h: '6. Liability',
        body: 'The service is provided as-is. We work hard on safety tools and verification, but we cannot guarantee attendance, conduct, or outcomes of meetups. Report problems in-app — we review every report.',
      },
      {
        h: '7. Ending things',
        body: 'You can log out or delete your account anytime in Settings. Deletion is processed within 30 days. These terms are governed by the laws of the Republic of the Philippines.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: March 2027',
    sections: [
      {
        h: '1. What we collect',
        body: 'Your profile (name, age, photos), phone number, buckets and plans, and approximate location to show meetups near you. For identity verification we keep only the pass/fail result — never your ID photos or biometrics.',
      },
      {
        h: '2. How we use it',
        body: 'To match you with plans and people, keep meetups safe, and send notifications you asked for. We never sell your personal data.',
      },
      {
        h: '3. Your rights under RA 10173',
        body: 'Under the Data Privacy Act of 2012 (RA 10173) you have the right to be informed, to access your data, to correct it, to object to processing, to export a copy (data portability), to erasure or blocking, and to lodge a complaint with the National Privacy Commission.',
      },
      {
        h: '4. Download and delete',
        body: 'Request a copy of your data from Privacy → Your data — we email it within 48 hours. Account and data deletion requests are processed within 30 days.',
      },
      {
        h: '5. Contact',
        body: 'Our Data Protection Officer is reachable at privacy@tarabucket.ph for any privacy question, request, or concern.',
      },
    ],
  },
  guidelines: {
    title: 'Community Guidelines',
    updated: 'Last updated: March 2027',
    sections: [
      {
        h: 'Respeto muna',
        body: 'Treat everyone like barkada. No hate speech, discrimination, or bullying — sa app man o sa mismong lakad.',
      },
      {
        h: 'No harassment',
        body: 'No unwanted advances, stalking, doxxing, or pressuring people who said no. Block and report tools are one tap away, and we act on every report.',
      },
      {
        h: 'Real, verified people',
        body: 'Use your real name and recent photos, one account per person. Verification keeps every meetup real — impersonation and fake accounts get banned.',
      },
      {
        h: 'Safety-first meetups',
        body: 'Meet at public venues, share your plan with a trusted contact, and use the in-app SOS if something feels off. Hosts look after their group. Never bring or invite minors.',
      },
      {
        h: 'Breaking the rules',
        body: 'Violations can mean a warning, suspension, or permanent ban depending on severity. Serious safety issues go straight to permanent ban.',
      },
    ],
  },
};

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const key: DocKey = doc === 'privacy' || doc === 'guidelines' ? doc : 'terms';
  const d = DOCS[key];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title={d.title} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Txt weight="medium" className="mt-3 text-[12px] text-brand-faint">{d.updated}</Txt>
        {d.sections.map((s) => (
          <View key={s.h} className="mt-6">
            <Txt weight="bold" className="text-[15px] text-brand-ink">{s.h}</Txt>
            <Txt weight="medium" className="mt-1.5 text-[13px] leading-[20px] text-brand-muted">{s.body}</Txt>
          </View>
        ))}
        <Txt weight="medium" className="mt-8 text-center text-[12px] text-brand-faint">
          Tara Bucket! · Made in the Philippines 🇵🇭
        </Txt>
      </ScrollView>
    </View>
  );
}
