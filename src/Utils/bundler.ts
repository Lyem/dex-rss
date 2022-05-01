import updates from '../Interfaces/updates'

async function bundler(mangas: Array<updates.RootObject>) {
  const newMangas: updates.RootObject[] = []
  while (mangas.length != 0) {
    const first = mangas[0]

    const compress = mangas.filter(
      (data: updates.RootObject) => data.mangaId == first.mangaId
    )

    const manga = {
      manga: mangas[0].manga,
      mangaId: mangas[0].mangaId,
      chId: compress[0].chId,
      ch: `${
        compress.length > 1
          ? `Cap ${compress[0].ch} - Cap ${compress[compress.length - 1].ch}`
          : `Cap ${compress[0].ch}`
      }`
    }

    newMangas.push(manga)

    mangas = mangas.filter(
      (data: updates.RootObject) => data.mangaId != first.mangaId
    )
  }
  return newMangas
}

export default bundler
