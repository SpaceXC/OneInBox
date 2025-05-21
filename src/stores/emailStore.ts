import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Email } from 'postal-mime'
import AV from 'leancloud-storage'
import PostalMime from 'postal-mime'

export const useEmailStore = defineStore('email', () => {
  const emails = ref<{ date: string, emails: [string, Email, boolean][] }[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const unreadCount = ref<number | undefined>(undefined)

  const emailList = ref<[string, Email, boolean][]>([])

  // 按日期分组邮件并排序
  function groupByDate(emailEntries: [string, Email, boolean][]) {
    const emailMap = new Map<string, [string, Email, boolean]>()
    emailEntries.forEach(([id, email, read]) => {
      if (!email.date) return
      if (!emailMap.has(id)) {
        emailMap.set(id, [id, email, read])
      } else {
        // 如果重复ID，保留已读状态为 true
        const existing = emailMap.get(id)!
        emailMap.set(id, [id, email, existing[2] && read])
      }
    })

    const grouped: { date: string, emails: [string, Email, boolean][] }[] = []
    for (const [id, email, read] of emailMap.values()) {
      const date = dayjs(email.date).format('YYYY-MM-DD')
      let group = grouped.find(g => g.date === date)
      if (!group) {
        group = { date, emails: [] }
        grouped.push(group)
      }
      group.emails.push([id, email, read])
    }
    grouped.sort((a, b) => b.date.localeCompare(a.date))
    return grouped
  }

  async function addEmail(lcObject: AV.Queriable) {
    const parsedEmail = await PostalMime.parse(lcObject.get("rawEmail"))
    emailList.value = [[lcObject.id ?? "", parsedEmail, (lcObject.get("read") as boolean)], ...emailList.value]
    emails.value = groupByDate(emailList.value)
    getUnreadCount()
  }

  function removeEmail(id: string) {
    emailList.value = emailList.value.filter(email => email[0] !== id)
    emails.value = groupByDate(emailList.value)
    getUnreadCount()
  }

  async function getUnreadCount() {
    const query = new AV.Query("Emails");
    query.equalTo("read", false)
    unreadCount.value = await query.count()
  }

  async function markAsRead(id: string) {
    const targetIndex = emailList.value.findIndex(email => email[0] === id)
    if (targetIndex === -1) return
    emailList.value[targetIndex][2] = true
    emails.value = groupByDate(emailList.value)
    const lcObject = AV.Object.createWithoutData("Emails", id)
    lcObject.set("read", true)
    await lcObject.save()
    getUnreadCount()
  }

  async function updateEmail(lcObject: AV.Queriable) {
    const read = lcObject.get("read") as boolean
    const targetIndex = emailList.value.findIndex(email => email[0] === lcObject.id)
    if (targetIndex === -1) return
    emailList.value[targetIndex][2] = read
    emails.value = groupByDate(emailList.value)
    getUnreadCount()
  }

  async function fetchEmails(refresh: boolean, page: number = 1) {
    isLoading.value = true
    const AV = await import('leancloud-storage/live-query')
    const query = new AV.Query("Emails");
    query.descending("createdAt")
    query.limit(20)
    if (!refresh) {
      query.skip((page - 1) * 20)
    }
    const lcEmails = await query.find()
    const parsedEmailEntries = await Promise.all(
      lcEmails.map(async (email: any) => {
        const parsed = await PostalMime.parse(email.get("rawEmail"));
        return [email.id ?? "", parsed, email.get("read") as boolean] as [string, Email, boolean]
      })
    )
    if (refresh) {
      emailList.value = parsedEmailEntries
    }
    else {
      emailList.value = [...emailList.value, ...parsedEmailEntries]
    }
    // 按日期分组并排序
    const groupedEmails = groupByDate(emailList.value)
    emails.value = groupedEmails
    isLoaded.value = true
    isLoading.value = false
    getUnreadCount()
  }

  return { emails, isLoaded, isLoading, unreadCount, fetchEmails, addEmail, removeEmail, updateEmail, markAsRead}
})