import dayjs from 'dayjs'

export function labelDate(dateStr: string): string {
  const date = dayjs(dateStr)
  const today = dayjs().startOf('day')
  const diff = today.diff(date.startOf('day'), 'day')

  switch (diff) {
    case 0:
      return '今天'
    case 1:
      return '昨天'
    case 2:
      return '前天'
    case 3:
      return '大前天'
    default:
      return date.format('YYYY-MM-DD')
  }
}