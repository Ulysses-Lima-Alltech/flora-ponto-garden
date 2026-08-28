// Flora's animated avatar. Primary path: a short looping idle video
// (public/avatars/flora-idle.mp4), generated from the official illustration
// and bundled locally -- works fully offline, no external avatar service.
//
// The 3D talking-head path (TalkingHead.js + a Ready Player Me-compatible
// .glb) is still supported as an opt-in fallback via VITE_FLORA_AVATAR_URL,
// for whenever a properly rigged, on-brand 3D avatar becomes available. It
// is off by default now: Ready Player Me shut down public access in
// Jan/2026 (acquired by Netflix), and the generic demo avatars available
// elsewhere either fail to load (vroid.glb uses Meshopt compression, which
// TalkingHead's bundled GLTFLoader doesn't support) or bring unclear
// licensing for a published app (avaturn.glb).
export const VIDEO_URL = '/avatars/flora-idle.mp4'

export const AVATAR_URL = import.meta.env.VITE_FLORA_AVATAR_URL as string | undefined
export const isFloraAvatarConfigured = Boolean(AVATAR_URL)
