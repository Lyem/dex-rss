// eslint-disable-next-line @typescript-eslint/no-var-requires
const Guild = require('../Models/guilds')
import moment from 'moment'
import axios from 'axios'
import smallerDate from '../Utils/smaller_date'
import bundler from '../Utils/bundler'
import lastUpdates from '../Interfaces/last_updates'
import updates from '../Interfaces/updates'
import sleep from '../Utils/sleep'

class Rss {
  async getInfos(
    lang: string,
    guildId: string,
    webHook: string,
    lastMangaUpdate: Date
  ) {
    console.log('getInfos')
    let offset = 0
    const limit = 32
    let notFinish = true
    const mangas: updates.RootObject[] = []
    while (notFinish) {
      const response = await axios.get<lastUpdates.RootObject>(
        `https://api.mangadex.org/chapter?limit=${limit}&offset=${offset}&translatedLanguage[]=${lang}&includes[]=user&includes[]=scanlation_group&includes[]=manga&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[readableAt]=desc`
      )
      const data = response.data
      data.data.map((data: lastUpdates.Datum) => {
        if (new Date(data.attributes.createdAt) > lastMangaUpdate) {
          try {
            const manga = data.relationships.filter(
              (data: lastUpdates.Relationship) => data.type == 'manga'
            )
            mangas.push({
              ch:
                data.attributes.chapter == null
                  ? 'Oneshot'
                  : data.attributes.chapter,
              chId: data.id,
              createdAt: data.attributes.createdAt,
              manga: manga[0].attributes.title.en,
              mangaId: manga[0].id
            })
          } catch (e) {
            console.log(e)
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
    const update =
      mangas.length != 0
        ? {
            lastUpdate: new Date(),
            lastMangaUpdate: mangas[0].createdAt
          }
        : {
            lastUpdate: new Date()
          }
    await Guild.findByIdAndUpdate(
      guildId,
      {
        $set: update
      },
      { new: true }
    )

    this.send(webHook, mangas)
  }

  async send(webHook: string, mangas: Array<updates.RootObject>) {
    console.log('send')
    const newMangas = await bundler(mangas.slice(0).reverse())
    for (let index = 0; index < newMangas.length; index++) {
      await sleep(3000)
      axios.post(`${webHook}`, {
        username: 'dex',
        avatar_url: 'https://mangadex.org/avatar.png',
        embeds: [
          {
            title: `${newMangas[index].manga}`,
            url: `https://mangadex.org/title/${newMangas[index].mangaId}`,
            description: `[${newMangas[index]['ch']}](https://mangadex.org/chapter/${newMangas[index].chId})`,
            color: 15258703,
            image: {
              url: `https://og.mangadex.org/og-image/chapter/${newMangas[index].chId}`
            },
            footer: {
              text: 'Uma cortesia Dexbr',
              icon_url: 'https://mangadex.org/avatar.png'
            }
          }
        ]
      })
    }
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
        this.getInfos(
          guild.lang,
          guild._id,
          guild.webHook,
          new Date(guild.lastMangaUpdate)
        )
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
