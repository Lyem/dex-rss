async function bundler(mangas: Array<any>) {
  const newMangas: any[] = []
  while (mangas.length != 0) {
    const compress = []
    for (let index = 0; index < mangas.length; index++) {
      if (index == 0) {
        compress.push(index)
      } else if (mangas[index]['mangaId'] == mangas[0]['mangaId']) {
        compress.push(index)
      }
    }

    const manga = {
      manga: mangas[0]['manga'],
      mangaId: mangas[0]['mangaId'],
      chId: mangas[compress[compress.length - 1]]['chId'],
      ch: `${
        compress.length > 1
          ? `Cap ${mangas[compress[compress.length - 1]]['ch']} - Cap ${
              mangas[compress[compress[0]]]['ch']
            }`
          : `Cap ${mangas[compress[compress[0]]]['ch']}`
      }`
    }

    newMangas.push(manga)

    compress.map((index) => {
      mangas.splice(index)
    })
  }
  return newMangas
}

export default bundler
