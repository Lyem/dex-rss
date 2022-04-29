// eslint-disable-next-line @typescript-eslint/no-var-requires
const Guild = require('../Models/guilds')
import moment from 'moment'
import axios from 'axios'
import smallerDate from '../Utils/smaller_date'

class Rss {
  async getInfos(
    lang: string,
    guildId: string,
    webHook: string,
    lastUpdate: Date
  ) {
    console.log('getInfos')
    let offset = 0
    const limit = 32
    let notFinish = true
    const mangas: any[] = []
    while (notFinish) {
      const response = await axios.get(
        `https://api.mangadex.org/chapter?limit=${limit}&offset=${offset}&translatedLanguage[]=${lang}&includes[]=user&includes[]=scanlation_group&includes[]=manga&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[readableAt]=desc`
      )
      const data = response.data
      data.data.map((data: any) => {
        if (new Date(data['attributes']['createdAt']) > lastUpdate) {
          try {
            mangas.push({
              ch: data['attributes']['chapter'],
              scan: data['relationships'][0]['attributes']['name'],
              scanId: data['relationships'][0]['id'],
              manga: data['relationships'][1]['attributes']['title']['en'],
              mangaId: data['relationships'][1]['id']
            })
          } catch {
            console.log('a')
          }
        } else {
          notFinish = false
        }
      })
      if (notFinish) {
        setTimeout(() => {
          offset = offset + limit
        }, 3000)
      }
    }
    await Guild.findByIdAndUpdate(
      guildId,
      { $set: { lastUpdate: new Date() } },
      { new: true }
    )

    this.send(webHook, mangas)
  }

  async send(webHook: string, mangas: Array<any>) {
    console.log('send')
    mangas.map((manga) => {
      axios.post(`${webHook}`, {
        username: 'dex',
        avatar_url: 'https://mangadex.org/_nuxt/img/avatar.8b8b63b.png',
        embeds: [
          {
            author: {
              name: `${manga['scan']}`,
              url: `https://mangadex.org/group/${manga['scanId']}`,
              icon_url: 'https://mangadex.org/_nuxt/img/avatar.8b8b63b.png'
            },
            title: `${manga['manga']}`,
            url: `https://mangadex.org/title/${manga['mangaId']}`,
            description: `Ch ${manga['ch']}`,
            color: 15258703,
            image: {
              url: `https://og.mangadex.org/og-image/manga/${manga['mangaId']}`
            }
          }
        ]
      })
    })

    this.verify()
  }

  async verify() {
    console.log('verify')
    const guilds = await Guild.find()
    const dates: Date[] = []
    guilds.map((guild: any) => {
      const lastUpdate = new Date(guild.lastUpdate)
      const nextUpdate = moment(lastUpdate).add(guild.timeUpdate, 's').toDate()
      if (new Date() > nextUpdate) {
        this.getInfos(guild.lang, guild._id, guild.webHook, lastUpdate)
      } else {
        dates.push(nextUpdate)
      }
    })
    const smaller_date = await smallerDate(dates)
    const nextVerify = +smaller_date - +new Date()
    setTimeout(() => {
      this.verify()
    }, nextVerify)
  }

  public async init() {
    console.log('[CLIENT]: Rss on air!')
    this.verify()
  }
}

export default Rss
