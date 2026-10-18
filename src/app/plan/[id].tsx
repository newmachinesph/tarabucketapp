import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarStack, Chip, IconButton, NotFound, PrimaryButton, TrustBadge } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { catColor, catEmoji, catLabel, PEOPLE } from '@/data/mock';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const HERO_HEIGHT = 300;

function DetailRow({
  icon,
  label,
  value,
  pill,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  pill?: string;
}) {
  return (
    <View className="flex-row items-center px-5 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
        <Ionicons name={icon} size={18} color={C.blue} />
      </View>
      <View className="ml-3 flex-1">
        <Txt weight="semibold" className="text-[11px] uppercase text-brand-muted" style={{ letterSpacing: 0.5 }}>
          {label}
        </Txt>
        <Txt weight="semibold" className="mt-1 text-[14px] text-brand-ink">
          {value}
        </Txt>
      </View>
      {pill ? (
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.green}1A` }}>
          <Txt weight="bold" className="text-[11px]" style={{ color: C.green }}>
            {pill}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const discovery = useStore((s) => s.discovery);
  const joinedIds = useStore((s) => s.joinedIds);
  const joinPlan = useStore((s) => s.joinPlan);
  const leavePlan = useStore((s) => s.leavePlan);
  const planNotes = useStore((s) => s.threads[id]) ?? [];
  const me = useStore((s) => s.me);
  const trustedContacts = useStore((s) => s.trustedContacts);
  const confirmedPlanIds = useStore((s) => s.confirmedPlanIds);
  const confirmAttendance = useStore((s) => s.confirmAttendance);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [split, setSplit] = useState<'50/50' | 'Libre ko' | 'Custom' | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [liveLoc, setLiveLoc] = useState(false);
  const plan = discovery.find((d) => d.id === id);
  if (!plan) return <NotFound label="Plan" />;

  const color = catColor(plan.category);
  const confirmed = joinedIds.includes(plan.id);
  const doubleConfirmed = confirmedPlanIds.includes(plan.id);
  const caption = `${plan.title}\n📅 ${plan.when}\n📍 ${plan.venue} · ${plan.area}\n\nTara? Sali ka! 🧡`;
  // ponytail: no expo-clipboard in deps — "Copy caption" rides the native share sheet (it has a Copy target).
  const shareCaption = () => Share.share({ message: caption }).catch(() => {});
  // ponytail: static going list from PEOPLE (host first), sized to plan.going — no real membership data.
  const going = [plan.host, ...PEOPLE.filter((p) => p.id !== plan.host.id)].slice(0, plan.going);
  const goingNames = going.slice(0, 2).map((p) => p.name.split(' ')[0]);
  const recentNotes = planNotes.slice(-2);

  return (
    <View className="flex-1 bg-white">
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 6, left: 16, zIndex: 20 }}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/35 active:opacity-80"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT }}>
          <Image source={{ uri: plan.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient
            colors={['rgba(14,23,38,0.35)', 'transparent', 'rgba(14,23,38,0.55)', 'rgba(14,23,38,0.96)']}
            locations={[0, 0.32, 0.62, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={{ position: 'absolute', top: insets.top + 6, right: 16 }}>
            <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: color }}>
              <Txt className="mr-1 text-xs">{catEmoji(plan.category)}</Txt>
              <Txt weight="bold" className="text-[11px] text-white">
                {catLabel(plan.category)}
              </Txt>
            </View>
          </View>

          <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
            {doubleConfirmed && (
              <View className="mb-2 flex-row items-center self-start rounded-full px-3 py-1.5" style={{ backgroundColor: C.green }}>
                <Ionicons name="checkmark-done" size={12} color={C.white} />
                <Txt weight="bold" className="ml-1 text-[11px] text-white">
                  Attendance confirmed ✓
                </Txt>
              </View>
            )}
            <Txt weight="black" className="text-white" style={{ fontSize: 26, lineHeight: 30 }}>
              {plan.title}
            </Txt>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Txt weight="medium" className="ml-1 text-[13px] text-white/85">
                {plan.venue} · {plan.area}
              </Txt>
            </View>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Txt weight="medium" className="ml-1 text-[13px] text-white/85">
                {plan.when}
              </Txt>
            </View>
          </View>
        </View>

        {/* Host card */}
        <View className="mx-5 mt-5 flex-row items-center rounded-3xl border border-black/5 bg-brand-surface p-4">
          <Avatar uri={plan.host.avatar} size={48} ring={C.white} />
          <View className="ml-3 flex-1">
            <Txt weight="semibold" className="text-[11px] uppercase" style={{ color: C.orangeDark, letterSpacing: 0.6 }}>
              HOST
            </Txt>
            <View className="mt-1 flex-row items-center">
              <Txt weight="bold" className="text-[15px] text-brand-ink">
                {plan.host.name.split(' ')[0]}, {plan.host.age}
              </Txt>
              {plan.host.verified && (
                <Ionicons name="checkmark-circle" size={15} color={C.blue} style={{ marginLeft: 4 }} />
              )}
              <View className="ml-2">
                <TrustBadge score={plan.host.trust} />
              </View>
            </View>
          </View>
          <IconButton
            name="chatbubble-ellipses-outline"
            diameter={44}
            size={20}
            color={C.blue}
            bg={C.white}
            onPress={() => router.push({ pathname: '/plan-note', params: { id: plan.id } })}
            accessibilityLabel="Message host"
          />
        </View>

        {/* Who's going */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <AvatarStack uris={going.map((p) => p.avatar)} size={34} max={5} />
              <View className="ml-3">
                <Txt weight="bold" className="text-[14px] text-brand-ink">
                  {plan.going}/{plan.spots} going
                </Txt>
                <Txt weight="medium" className="text-[12px] text-brand-muted">
                  {goingNames.join(', ')} & more
                </Txt>
              </View>
            </View>
            {confirmed && (
              <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: `${C.green}1A` }}>
                <Txt weight="bold" className="text-[12px]" style={{ color: C.green }}>
                  ✓ You&apos;re in
                </Txt>
              </View>
            )}
          </View>
        </View>

        {/* Double-confirm attendance (demo: window check skipped — always enabled) */}
        {!doubleConfirmed && (
          <Pressable
            onPress={() => {
              confirmAttendance(plan.id);
              hSuccess();
              toast('Attendance confirmed ✓');
            }}
            accessibilityRole="button"
            accessibilityLabel="Double-confirm attendance"
            className="mx-5 mt-3 flex-row items-center justify-center rounded-2xl border py-3 active:opacity-70"
            style={{ borderColor: `${C.green}55`, backgroundColor: `${C.green}0A` }}
          >
            <Ionicons name="checkmark-done" size={16} color={C.green} />
            <Txt weight="bold" className="ml-1.5 text-[13px]" style={{ color: C.green }}>
              Double-confirm attendance
            </Txt>
          </Pressable>
        )}

        {/* Details */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5">
          <DetailRow icon="calendar-outline" label="When" value={plan.when} />
          <View className="mx-5 h-px" style={{ backgroundColor: C.line }} />
          <DetailRow icon="shield-checkmark-outline" label="Venue" value={plan.venue} pill="Vetted ✓" />
          <View className="mx-5 h-px" style={{ backgroundColor: C.line }} />
          <DetailRow
            icon="people-outline"
            label="Group-first"
            value={`Group of ${plan.spots} · everyone ID-verified`}
          />
        </View>

        {/* Split agreement */}
        <View
          className="mx-5 mt-3 rounded-3xl p-4"
          style={{ backgroundColor: `${C.blue}0F`, borderWidth: 1, borderColor: `${C.blue}1A` }}
        >
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[16px] text-brand-ink">
              Split agreement
            </Txt>
            {split ? (
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.green}1A` }}>
                <Txt weight="bold" className="text-[10px]" style={{ color: C.green }}>
                  Split agreed: {split} ✓
                </Txt>
              </View>
            ) : (
              <View className="rounded-full bg-black/5 px-2.5 py-1">
                <Txt weight="semibold" className="text-[10px] text-brand-muted">
                  Tap to agree
                </Txt>
              </View>
            )}
          </View>
          <View className="mt-3 flex-row gap-2">
            <Chip
              label="50/50"
              active={split === '50/50'}
              onPress={() => {
                setSplit('50/50');
                toast('Split agreed: 50/50 ✓');
              }}
            />
            <Chip
              label="Libre ko"
              active={split === 'Libre ko'}
              onPress={() => {
                setSplit('Libre ko');
                toast('Split agreed: Libre ko ✓ — ang bait mo');
              }}
            />
            <Chip
              label="Custom"
              active={split === 'Custom'}
              onPress={() => {
                setSplit('Custom');
                toast('Split agreed: Custom ✓');
              }}
            />
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/kkb', params: { people: String(plan.going) } })}
            className="mt-3 flex-row items-center justify-center rounded-2xl border py-2.5 active:opacity-70"
            style={{ borderColor: `${C.blue}40`, backgroundColor: `${C.blue}0A` }}
            accessibilityRole="button"
            accessibilityLabel="Compute the split in the KKB calculator"
          >
            <Ionicons name="calculator-outline" size={16} color={C.blue} />
            <Txt weight="bold" className="ml-1.5 text-[13px] text-brand-blue">Compute the split</Txt>
          </Pressable>
          <Txt weight="medium" className="mt-3 text-[12px] text-brand-muted">
            Tara doesn&apos;t handle payments — settle at the venue.
          </Txt>
        </View>

        {/* Share sa GC */}
        <Pressable
          onPress={() => setShareOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Share this plan to your group chat"
          className="mx-5 mt-3 flex-row items-center justify-center rounded-2xl border py-3 active:opacity-70"
          style={{ borderColor: `${C.orange}40`, backgroundColor: `${C.orange}0A` }}
        >
          <Ionicons name="share-social-outline" size={16} color={C.orange} />
          <Txt weight="bold" className="ml-1.5 text-[13px]" style={{ color: C.orange }}>
            Share sa GC
          </Txt>
        </Pressable>

        {/* Plan-note preview */}
        <View className="mx-5 mt-6 flex-row items-center justify-between">
          <Txt weight="black" className="text-[18px] text-brand-ink">
            Plan chat
          </Txt>
          <Pressable
            onPress={() => router.push({ pathname: '/plan-note', params: { id: plan.id } })}
            className="active:opacity-70"
          >
            <Txt weight="semibold" className="text-[13px] text-brand-blue">
              Open plan chat
            </Txt>
          </Pressable>
        </View>

        <View className="mx-5 mt-3">
          {recentNotes.map((note) => (
            <View
              key={note.id}
              className={`mb-2 flex-row items-end ${note.mine ? 'justify-end' : 'justify-start'}`}
            >
              {!note.mine && <Avatar uri={note.from.avatar} size={28} />}
              <View
                className="mx-2 max-w-[78%] rounded-2xl px-3.5 py-2.5"
                style={{ backgroundColor: note.mine ? C.orange : C.surface }}
              >
                {!note.mine && (
                  <Txt weight="semibold" className="text-[11px]" style={{ color: C.orangeDark }}>
                    {note.from.name.split(' ')[0]}
                  </Txt>
                )}
                <Txt weight="regular" className="text-[13px]" style={{ color: note.mine ? C.white : C.ink }}>
                  {note.text}
                </Txt>
              </View>
              {note.mine && <Avatar uri={me.avatar} size={28} />}
            </View>
          ))}
        </View>

        {/* Safety strip */}
        <View className="mx-5 mt-6 flex-row items-center justify-between rounded-2xl border border-black/5 bg-brand-surface px-4 py-3">
          <Pressable
            onPress={() => router.push({ pathname: '/report', params: { id: plan.host.id } })}
            accessibilityRole="button"
            accessibilityLabel="Report this host"
            className="flex-row items-center active:opacity-70"
          >
            <Txt className="text-[13px]">🛡</Txt>
            <Txt weight="semibold" className="ml-2 text-[12px] text-brand-muted">
              Report
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => {
              setLiveLoc((v) => !v);
              toast(
                liveLoc
                  ? 'Live location off'
                  : `Live location on — shared with ${trustedContacts.length} trusted contact${trustedContacts.length === 1 ? '' : 's'} 📍`,
              );
            }}
            accessibilityRole="switch"
            accessibilityState={{ checked: liveLoc }}
            accessibilityLabel="Share live location"
            className="items-center active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color={liveLoc ? C.green : C.muted} />
              <Txt
                weight="semibold"
                className="ml-1.5 text-[12px]"
                style={{ color: liveLoc ? C.green : C.muted }}
              >
                {liveLoc ? 'Live location on' : 'Share live location'}
              </Txt>
            </View>
            <Txt weight="medium" className="mt-0.5 text-[10px] text-brand-faint">
              {trustedContacts.length} trusted contact{trustedContacts.length === 1 ? '' : 's'}
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => router.push('/sos')}
            accessibilityRole="button"
            accessibilityLabel="SOS"
            className="flex-row items-center active:opacity-70"
          >
            <Ionicons name="alert-circle-outline" size={14} color={C.red} />
            <Txt weight="bold" className="ml-1.5 text-[12px]" style={{ color: C.red }}>
              SOS
            </Txt>
          </Pressable>
        </View>
      </ScrollView>

      {/* Share sa GC — chat-card preview */}
      <Modal visible={shareOpen} transparent animationType="fade" onRequestClose={() => setShareOpen(false)}>
        <Pressable
          onPress={() => setShareOpen(false)}
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(14,23,38,0.55)' }}
        >
          {/* Stop backdrop-press from closing when tapping the card itself */}
          <Pressable onPress={() => {}} className="w-full rounded-3xl bg-white p-5">
            <Txt weight="semibold" className="text-[11px] uppercase text-brand-faint" style={{ letterSpacing: 0.6 }}>
              Preview — how it lands sa GC
            </Txt>
            <View className="mt-3 rounded-2xl rounded-tl-md p-4" style={{ backgroundColor: C.surface }}>
              <View className="flex-row items-center">
                <Txt className="text-[14px]">{catEmoji(plan.category)}</Txt>
                <Txt weight="bold" className="ml-1.5 flex-1 text-[15px] text-brand-ink" numberOfLines={1}>
                  {plan.title}
                </Txt>
              </View>
              <Txt weight="medium" className="mt-2 text-[12.5px] text-brand-muted">
                📅 {plan.when}
              </Txt>
              <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
                📍 {plan.venue} · {plan.area}
              </Txt>
              <View className="mt-3 self-start rounded-2xl rounded-bl-md px-3.5 py-2" style={{ backgroundColor: C.orange }}>
                <Txt weight="bold" className="text-[13px] text-white">
                  Tara? Sali ka! 🧡
                </Txt>
              </View>
            </View>
            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                onPress={shareCaption}
                accessibilityRole="button"
                accessibilityLabel="Copy caption"
                className="flex-1 flex-row items-center justify-center rounded-2xl border py-3 active:opacity-70"
                style={{ borderColor: C.line }}
              >
                <Ionicons name="copy-outline" size={16} color={C.blue} />
                <Txt weight="bold" className="ml-1.5 text-[13px] text-brand-blue">
                  Copy caption
                </Txt>
              </Pressable>
              <Pressable
                onPress={shareCaption}
                accessibilityRole="button"
                accessibilityLabel="Share"
                className="flex-1 flex-row items-center justify-center rounded-2xl py-3 active:opacity-90"
                style={{ backgroundColor: C.orange }}
              >
                <Ionicons name="share-social" size={16} color={C.white} />
                <Txt weight="bold" className="ml-1.5 text-[13px] text-white">
                  Share
                </Txt>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sticky bottom bar */}
      <View
        className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <PrimaryButton
          label={confirmed ? "You're going ✓" : "Confirm I'm going"}
          icon="checkmark-circle"
          onPress={() => {
            if (confirmed) return;
            if (joinPlan(plan.id)) {
              hSuccess();
              toast('Confirmed — see you there! 🎉');
            } else if (plan.going >= plan.spots) {
              toast('This table is full');
            } else {
              // Real cause is the free-stranger gate — take them to Premium.
              toast('Out of free stranger Taras — go Premium to join more');
              router.push({ pathname: '/premium', params: { reason: 'strangers' } });
            }
          }}
        />
        <Pressable
          onPress={() => {
            if (confirmed) {
              leavePlan(plan.id);
              toast("You've left this plan");
            } else {
              toast('No worries — maybe next time');
            }
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={confirmed ? 'Leave this plan' : "Can't make it"}
          className="mt-1 items-center py-3 active:opacity-70"
        >
          <Txt weight="semibold" className="text-[13px] text-brand-muted">
            {confirmed ? 'Leave this plan' : "Can't make it"}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}
