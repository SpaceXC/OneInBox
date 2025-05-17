import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Email } from 'postal-mime'

export const useEmailStore = defineStore('email', () => {
  // emails: Array<{ date: string, emails: [string, Email][] }>
  const emails = ref<{ date: string, emails: [string, Email][] }[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  // 按日期分组邮件并排序
  function groupByDate(emailEntries: [string, Email][]) {
    const grouped: { date: string, emails: [string, Email][] }[] = []
    emailEntries.forEach(([id, email]) => {
      const rawDate = email.date
      if (!rawDate) return
      const date = dayjs(rawDate).format('YYYY-MM-DD')
      let group = grouped.find(g => g.date === date)
      if (!group) {
        group = { date, emails: [] }
        grouped.push(group)
      }
      group.emails.push([id, email])
    })
    grouped.sort((a, b) => b.date.localeCompare(a.date))
    return grouped
  }

  async function refreshEmails() {
    isLoading.value = true
    const AV = await import('leancloud-storage/live-query')
    const PostalMime = (await import('postal-mime')).default
    const query = new AV.Query("Emails");
    query.descending("createdAt")
    query.limit(1000)
    const lcEmails = await query.find()
    const parsedEmailEntries = await Promise.all(
      lcEmails.map(async (email: any) => {
        const parsed = await PostalMime.parse(email.get("rawEmail"));
        return [email.id ?? "", parsed] as [string, Email]
      })
    )
    // 按日期分组并排序
    const groupedEmails = groupByDate(parsedEmailEntries)
    emails.value = groupedEmails
    isLoaded.value = true
    isLoading.value = false
  }

  return { emails, isLoaded, isLoading, refreshEmails }
})