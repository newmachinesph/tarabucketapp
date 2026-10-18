import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarStack, NotFound, PrimaryButton, Stat, TrustBadge } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { catColor, catEmoji, catLabel, kadasOf, PEOPLE, profileExtra, publicBucketsOf } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { BLUE_GRADIENT, C } from '@/lib/tokens';
import { useStore } from '@/store';

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useStore((s) => s.me);
  const friendIds = useStore((s) => s.friendIds);
  const requestedIds = useStore((s) => s.requestedIds);
  const followingIds = useStore((s) => s.followingIds);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const requestFriend = useStore((s) => s.requestFriend);
  const removeFriend = useStore((s) => s.removeFriend);

  const user = id === me.id ? me : PEOPLE.find((p) => p.id === id);
  if (!user) return <NotFound label="Profile" />;

  // Per-user profile data — never the logged-in user's numbers.
  const extra = profileExtra(user.id);
  const mutualKadas = kadasOf(user.id);
  const publicBuckets = publicBucketsOf(user.id);

  const friend = friendIds.includes(user.id);
  const requested = requestedIds.includes(user.id);
  const following = followingIds.includes(user.id);
  const firstName = user.name.split(' ')[0] ?? user.name;

  const handlePrimary = () => {
    if (friend) {
      removeFriend(user.id);
      toast(`Removed ${firstName} as friend`);
      return;
    }
    if (requested) {
      requestFriend(user.id); // cancels the pending request
      return;
    }
    requestFriend(user.id);
    hSuccess();
    toast('Friend request sent');
  };

  const handleFollow = () => {
    toggleFollow(user.id);
    hLight();
    toast(following ? 'Unfollowed' : 'Following ✓');
  };

  const primaryLabel = friend ? 'Friends' : requested ? 'Requested' : 'Add friend';
  const primaryIcon = friend ? 'checkmark-done' : requested ? 'checkmark' : 'person-add';

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}>
        {/* Cover */}
        <LinearGradient colors={BLUE_GRADIENT} style={{ height: 132 + insets.top, paddingTop: insets.top + 6 }}>
          <View className="flex-row items-center justify-between px-4">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name="chevron-back" size={22} color={C.white} />
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/report', params: { id: user.id } })}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={C.white} />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Identity */}
        <View className="items-center" style={{ marginTop: -46 }}>
          <View style={{ borderWidth: 4, borderColor: C.white, borderRadius: 999 }}>
            <Avatar uri={user.avatar} size={88} />
          </View>
          <View className="mt-3 flex-row items-center">
            <Txt weight="black" className="text-[22px] text-brand-ink">
              {user.name}, {user.age}
            </Txt>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={18} color={C.blue} style={{ marginLeft: 4 }} />
            )}
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            <Txt weight="medium" className="text-[13px] text-brand-muted">
              @{user.handle}
            </Txt>
            <TrustBadge score={user.trust} />
          </View>
          <Txt weight="medium" className="mt-3 px-8 text-center text-[13px] leading-[19px] text-brand-muted">
            {extra.bio}
          </Txt>
        </View>

        {/* Stats */}
        <View className="mx-5 mt-5 flex-row items-center justify-around rounded-3xl border border-black/5 py-4">
          <Stat value={String(extra.plans)} label="Plans" />
          <View className="h-8 w-px bg-black/5" />
          <Stat value={String(mutualKadas.length)} label="Kadas" />
          <View className="h-8 w-px bg-black/5" />
          <Stat value={String(user.trust)} label="Show-up" />
        </View>
        <Txt weight="semibold" className="mt-2 text-center text-[12.5px] text-brand-muted">
          {extra.followers} followers · {extra.following} following
        </Txt>

        {/* Interests */}
        <Txt weight="black" className="mx-5 mt-6 text-[16px] text-brand-ink">
          Interests
        </Txt>
        <View className="mx-5 mt-3 flex-row flex-wrap gap-2">
          {extra.interests.map((i) => (
            <View key={i} className="rounded-full bg-brand-surface px-4 py-2">
              <Txt weight="semibold" className="text-[13px] text-brand-ink">
                {i}
              </Txt>
            </View>
          ))}
        </View>

        {/* Mutual kadas */}
        <Txt weight="black" className="mx-5 mt-6 text-[16px] text-brand-ink">
          Mutual kadas
        </Txt>
        <View className="mx-5 mt-3 gap-3">
          {mutualKadas.map((k) => (
            <Pressable
              key={k.id}
              onPress={() => router.push({ pathname: '/kada/[id]', params: { id: k.id } })}
              className="flex-row items-center rounded-3xl border border-black/5 p-3 active:opacity-80"
            >
              <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${k.color}1A` }}>
                <Txt style={{ fontSize: 22 }}>{k.emoji}</Txt>
              </View>
              <View className="ml-3 flex-1">
                <Txt weight="bold" className="text-[14px] text-brand-ink">
                  {k.name}
                </Txt>
                <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
                  {k.members.length} members · Level {k.level}
                </Txt>
              </View>
              <AvatarStack uris={k.members.map((m) => m.avatar)} size={24} max={3} />
            </Pressable>
          ))}
        </View>

        {/* Public buckets */}
        <Txt weight="black" className="mx-5 mt-6 text-[16px] text-brand-ink">
          Public buckets
        </Txt>
        <View className="mx-5 mt-3 gap-3">
          {publicBuckets.map((b) => {
            const color = catColor(b.category);
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push({ pathname: '/bucket/[id]', params: { id: b.id } })}
                className="flex-row items-center rounded-3xl border border-black/5 p-3 active:opacity-80"
              >
                <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
                  <Txt style={{ fontSize: 20 }}>{catEmoji(b.category)}</Txt>
                </View>
                <View className="ml-3 flex-1">
                  <Txt weight="bold" className="text-[13.5px] text-brand-ink" numberOfLines={1}>
                    {b.title}
                  </Txt>
                  <Txt weight="medium" className="mt-0.5 text-[12px]" style={{ color }}>
                    {catLabel(b.category)} · {b.interested} interested
                  </Txt>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View className="border-t px-5 pt-4" style={{ borderColor: C.line, paddingBottom: insets.bottom + 14 }}>
        <PrimaryButton label={primaryLabel} icon={primaryIcon} onPress={handlePrimary} />
        <View className="mt-3 flex-row gap-3">
          <Pressable
            onPress={handleFollow}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-2xl active:opacity-80"
            style={{ backgroundColor: following ? C.blue : C.surface }}
          >
            <Ionicons
              name={following ? 'checkmark' : 'person-outline'}
              size={18}
              color={following ? C.white : C.ink}
              style={{ marginRight: 7 }}
            />
            <Txt weight="bold" className="text-[14px]" style={{ color: following ? C.white : C.ink }}>
              {following ? 'Following' : 'Follow'}
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/plan-note', params: { id: user.id, title: user.name, kind: 'dm' } })}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-2xl active:opacity-80"
            style={{ backgroundColor: C.surface }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.ink} style={{ marginRight: 7 }} />
            <Txt weight="bold" className="text-[14px]" style={{ color: C.ink }}>
              Message
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
