import MongoServer from './Database/db'
import Rss from './Client'

MongoServer()

new Rss().init()
