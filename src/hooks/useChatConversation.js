import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useConfirm } from '../context/ConfirmContext.jsx'
import { useMessaging } from '../context/MessagingContext.jsx'
import {
  blockUser, getConversation, listBlockedUsers, listConversationMessages, markConversationRead, sendChatMessage, unblockUser
} from '../services/api.js'

const addIfMissing = (list, message) => (list.some(m => m.id === message.id) ? list : [...list, message])

// Tek bir konuşmanın verisi ve eylemleri. Backend sayfaları en yeni mesaj
// önce (DESC) döndürür; burada kronolojik (eski -> yeni) tutulur.
export function useChatConversation(conversationId) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const { subscribeToMessages, refreshUnreadCount } = useMessaging()
  const navigate = useNavigate()

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMoreOlder, setHasMoreOlder] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false) // ben onu engelledim
  const [blockedByOther, setBlockedByOther] = useState(false) // o beni engellemiş

  // İkincil işlem: "okundu" başarısız olsa bile sohbet açık; nav rozeti bir
  // sonraki sayaç yenilemesinde kendiliğinden düzelir.
  const markRead = useCallback(() => {
    markConversationRead(token, conversationId).then(refreshUnreadCount).catch(() => {})
  }, [token, conversationId, refreshUnreadCount])

  useEffect(() => {
    if (!token || !conversationId) return undefined
    let alive = true
    setLoading(true)
    Promise.all([
      getConversation(token, conversationId),
      listConversationMessages(token, conversationId, { page: 0 }),
      // Engel durumu ayrı bir istek; başarısız olursa sohbet açılışını bozmasın.
      listBlockedUsers(token).catch(() => []),
    ])
      .then(([conv, msgPage, blocked]) => {
        if (!alive) return
        setConversation(conv)
        setMessages([...(msgPage?.content || [])].reverse())
        setHasMoreOlder(!(msgPage?.last ?? true))
        setPage(0)
        const iBlockedThem = Array.isArray(blocked) && blocked.some(b => b.userId === conv.otherUserId)
        setIsBlocked(iBlockedThem)
        // canMessage=false ve engelleyen ben değilsem, engelleyen karşı taraf.
        setBlockedByOther(conv.canMessage === false && !iBlockedThem)
        markRead()
      })
      .catch(err => {
        // Konuşma değiştiyse/unmount olduysa eski hatayla kullanıcıyı atma.
        if (!alive) return
        showError(err.message || 'Sohbet açılamadı.')
        navigate('/messages')
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token, conversationId, showError, navigate, markRead])

  // Bu sohbet açıkken gelen canlı mesajı ekle ve okundu işaretle.
  useEffect(() => subscribeToMessages((message) => {
    if (String(message.conversationId) !== String(conversationId)) return
    setMessages(prev => addIfMissing(prev, message))
    markRead()
  }), [subscribeToMessages, conversationId, markRead])

  const loadOlder = async () => {
    if (loadingOlder) return false
    const nextPage = page + 1
    setLoadingOlder(true)
    try {
      const res = await listConversationMessages(token, conversationId, { page: nextPage })
      // Offset sayfalama + canlı gelen mesajlar: sayfalar çakışabilir, tekrarları at.
      setMessages(prev => {
        const known = new Set(prev.map(m => m.id))
        const older = [...(res?.content || [])].reverse().filter(m => !known.has(m.id))
        return [...older, ...prev]
      })
      setHasMoreOlder(!(res?.last ?? true))
      setPage(nextPage)
      return true
    } catch (err) {
      showError(err.message || 'Eski mesajlar yüklenemedi.')
      return false
    } finally {
      setLoadingOlder(false)
    }
  }

  const send = async ({ content, attachmentKey }) => {
    const message = await sendChatMessage(token, conversationId, { content, attachmentKey })
    // WS yankısı REST yanıtından önce gelmiş olabilir - çift ekleme yok.
    setMessages(prev => addIfMissing(prev, message))
  }

  const block = async () => {
    if (!conversation) return
    const ok = await confirm(
      `${conversation.otherUserName} kişisini engellemek istediğine emin misin? Artık birbirinize mesaj gönderemezsiniz.`,
      { title: 'Kullanıcıyı engelle', confirmLabel: 'Engelle' }
    )
    if (!ok) return
    try {
      await blockUser(token, conversation.otherUserId)
      setIsBlocked(true)
      showSuccess('Kullanıcı engellendi.')
    } catch (err) {
      showError(err.message || 'Engellenemedi.')
    }
  }

  const unblock = async () => {
    if (!conversation) return
    try {
      await unblockUser(token, conversation.otherUserId)
      setIsBlocked(false)
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    }
  }

  return {
    conversation, messages, loading, loadingOlder, hasMoreOlder,
    isBlocked, blockedByOther, loadOlder, send, block, unblock
  }
}
