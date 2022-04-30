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
              chId: data['id'],
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
        }, 5000)
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
    const newMangas = await bundler(mangas)
    newMangas.map((manga) => {
      axios.post(`${webHook}`, {
        username: 'dex',
        avatar_url: 'https://mangadex.org/_nuxt/img/avatar.8b8b63b.png',
        embeds: [
          {
            title: `${manga['manga']}`,
            url: `https://mangadex.org/title/${manga['mangaId']}`,
            description: `[${manga['ch']}](https://mangadex.org/chapter/${manga['chId']})`,
            color: 15258703,
            image: {
              url: `https://og.mangadex.org/og-image/chapter/${manga['chId']}`
            },
            footer: {
              text: 'Uma cortesia Dexbr',
              icon_url: 'https://mangadex.org/_nuxt/img/avatar.8b8b63b.png'
            }
          }
        ]
      })
    })
  }

  async verify() {
    console.log('verify')
    const guilds = await Guild.find()
    const dates: Date[] = []
    guilds.map((guild: any) => {
      const lastUpdate = new Date(guild.lastUpdate)
      const nextUpdate = moment(lastUpdate).add(guild.timeUpdate, 's').toDate()
      if (new Date() > nextUpdate) {
        dates.push(moment(new Date()).add(guild.timeUpdate, 's').toDate())
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
