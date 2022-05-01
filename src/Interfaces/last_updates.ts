type Nullable<T> = T | null

declare namespace lastUpdates {
  export interface Attributes {
    volume: Nullable<string>
    chapter: Nullable<string>
    title: Nullable<string>
    translatedLanguage: string
    externalUrl?: any
    publishAt: Date
    readableAt: Date
    createdAt: Date
    updatedAt: Date
    pages: number
    version: number
  }

  export interface Title {
    en: string
  }

  export interface AltTitle {
    ja: string
    en: string
    es: string
    ru: string
    zh: string
    fr: string
  }

  export interface Links {
    bw: string
    mu: string
    amz: string
    mal: string
    raw: string
    al: string
    ap: string
    kt: string
    nu: string
    engtl: string
    ebj: string
    cdj: string
  }

  export interface Name {
    en: string
  }

  export interface Attributes3 {
    name: Name
    description: any[]
    group: string
    version: number
  }

  export interface Tag {
    id: string
    type: string
    attributes: Attributes3
    relationships: any[]
  }

  export interface Attributes2 {
    title: Title
    altTitles: AltTitle[]
    description: any
    isLocked: boolean
    links: Links
    originalLanguage: string
    lastVolume: string
    lastChapter: string
    publicationDemographic: string
    status: string
    year?: number
    contentRating: string
    tags: Tag[]
    state: string
    chapterNumbersResetOnNewVolume: boolean
    createdAt: Date
    updatedAt: Date
    version: number
    availableTranslatedLanguages: string[]
    username: string
    roles: string[]
    name: string
    altNames: any[]
    locked?: boolean
    website: string
    ircServer?: any
    ircChannel?: any
    discord: string
    contactEmail: string
    twitter: string
    mangaUpdates?: any
    focusedLanguages: string[]
    official?: boolean
    verified?: boolean
    inactive?: boolean
    publishDelay?: any
  }

  export interface Relationship {
    id: string
    type: string
    attributes: Attributes2
  }

  export interface Datum {
    id: string
    type: string
    attributes: Attributes
    relationships: Relationship[]
  }

  export interface RootObject {
    result: string
    response: string
    data: Datum[]
    limit: number
    offset: number
    total: number
  }
}

export default lastUpdates
