declare module '@met4citizen/talkinghead' {
  export interface TalkingHeadOptions {
    lipsyncModules?: string[]
    modelFPS?: number
    modelPixelRatio?: number
    cameraView?: string
    avatarMute?: boolean
    [key: string]: unknown
  }

  export interface ShowAvatarOptions {
    url: string
    body?: 'M' | 'F'
    avatarMood?: string
    lipsyncLang?: string
    ttsLang?: string
    [key: string]: unknown
  }

  export class TalkingHead {
    constructor(node: HTMLElement, options?: TalkingHeadOptions)
    showAvatar(avatar: ShowAvatarOptions, onprogress?: (event: unknown) => void): Promise<void>
    playGesture(name: string, dur?: number, mirror?: boolean, ms?: number): void
    stopGesture(ms?: number): void
    setMood(mood: string): void
    makeEyeContact(t: number): void
    lookAtCamera(t: number): void
    setFixedValue(name: string, value: number | null): void
    start(): void
    stop(): void
  }
}
