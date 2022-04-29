import moment from 'moment'

async function smallerDate(dates: Array<Date>) {
  let smaller_date = moment(new Date()).add(10, 'h').toDate()
  dates.map((date: Date) => {
    if (date < smaller_date) {
      smaller_date = date
    }
  })
  return smaller_date
}

export default smallerDate
