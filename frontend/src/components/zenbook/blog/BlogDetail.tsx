'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  Eye,
  Calendar,
  Link as LinkIcon,
  Play,
  Pause,
  Square,
  Mic,
  Volume2
} from 'lucide-react'

import { FaFacebook } from 'react-icons/fa'
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'

// Import API lấy theo slug
import { getPublicNewsBySlugApi } from '@/services/news/news.api'
import type { NewsResponse } from '@/services/news/news.type'

// ── Helpers: Làm sạch HTML & Format Ngày ──────────────────────────────────────

// Chuyển đổi ngày sang chuỗi đọc tự nhiên: "ngày 26 tháng 4 năm 2026"
function getSpokenDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`
}

// Bóc tách nội dung sạch từ HTML (Loại bỏ ảnh, link, video, iframe...)
function extractCleanTextFromHTML(html: string) {
  if (!html) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Xóa các phần tử gây nhiễu khi đọc
  const noisyElements = doc.querySelectorAll(
    'img, figure, figcaption, iframe, video, audio, table, button, a'
  )
  noisyElements.forEach((el) => el.remove())

  // Lấy text thuần và dọn dẹp khoảng trắng thừa
  const text = doc.body.textContent || ''
  return text.replace(/\s+/g, ' ').trim()
}

// Làm đẹp tên giọng đọc
function formatVoiceName(voice: SpeechSynthesisVoice) {
  if (voice.name.includes('HoaiMy')) return 'Nữ (Hoài My - Cao cấp)'
  if (voice.name.includes('NamMinh')) return 'Nam (Nam Minh - Cao cấp)'
  if (voice.name.includes('An')) return 'Nam (Microsoft An)'
  if (voice.name.includes('Linh')) return 'Nữ (Siri Linh)'
  if (voice.name.includes('Google')) return 'Nữ (Google)'
  return voice.name
}

// ── 1. Hook quản lý Text-to-Speech (Đọc bài viết) ──────────────────────────

function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const synth = window.speechSynthesis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const fetchVoices = () => {
      const allVoices = synth.getVoices()
      const viVoices = allVoices.filter((v) => v.lang.includes('vi') || v.lang.includes('VN'))

      // Sắp xếp ưu tiên giọng xịn của Edge/Microsoft lên đầu
      const sortedVoices = viVoices.sort((a, b) => {
        if (a.name.includes('HoaiMy') || a.name.includes('NamMinh')) return -1
        return 1
      })

      setVoices(sortedVoices.length > 0 ? sortedVoices : allVoices.slice(0, 5))
      if (sortedVoices.length > 0) setSelectedVoice(sortedVoices[0])
    }

    fetchVoices()
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = fetchVoices
    }
  }, [synth])

  const stop = () => {
    synth.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  // Chuyển object post vào hàm play thay vì string
  const play = (post: NewsResponse) => {
    if (isPaused) {
      synth.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    stop()

    // --- XÂY DỰNG KỊCH BẢN ĐỌC (PODCAST SCRIPT) ---
    const scriptParts = []

    // 1. Tiêu đề
    scriptParts.push(post.title + '.')

    // 2. Tác giả + Ngày đăng
    const author = post.authorName || 'Biên tập viên ZenBook'
    const date = getSpokenDate(post.publishedAt || post.createdAt)
    scriptParts.push(`Được viết bởi ${author}, ${date}.`)

    // 3. Summary
    if (post.summary) {
      scriptParts.push(`Tóm tắt bài viết: ${post.summary}`)
    }

    // 4. Nội dung chính đã được làm sạch
    const cleanContent = extractCleanTextFromHTML(post.content)
    if (cleanContent) {
      scriptParts.push('Nội dung chi tiết:')
      scriptParts.push(cleanContent)
    }

    // 5. Kết bài
    scriptParts.push('Bạn vừa nghe xong bài viết. Cảm ơn bạn đã quan tâm theo dõi.')

    // Nối kịch bản lại
    const finalScript = scriptParts.join(' ... ')

    const utterance = new SpeechSynthesisUtterance(finalScript)
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.rate = rate
    utterance.pitch = 1
    utterance.lang = 'vi-VN'

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlaying(true)
  }

  const pause = () => {
    synth.pause()
    setIsPaused(true)
    setIsPlaying(false)
  }

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    isPlaying,
    isPaused,
    play,
    pause,
    stop
  }
}

// ── 2. Component Audio Player ────────────────────────────────────────────────

interface AudioPlayerProps {
  post: NewsResponse // Nhận toàn bộ object bài viết
}

function AudioPlayer({ post }: AudioPlayerProps) {
  const tts = useTextToSpeech()

  useEffect(() => {
    return () => tts.stop()
  }, [])

  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-1 border-y border-slate-100 my-6 bg-slate-50/50 rounded-xl'>
      <div className='flex items-center gap-3 px-3'>
        <div className='w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden'>
          <Mic className='w-5 h-5' />
        </div>
        <div>
          <p className='text-[11px] text-slate-500 uppercase font-bold tracking-wider'>
            Nghe bài viết
          </p>
          <p className='text-sm font-bold text-slate-800'>{post.authorName || 'ZenBook AI'}</p>
        </div>
      </div>

      <div className='flex items-center gap-2 sm:gap-4 px-3 sm:px-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0'>
        {/* Controls */}
        <div className='flex items-center gap-1.5 border border-slate-200 bg-white rounded-full p-1 shadow-sm shrink-0'>
          {tts.isPlaying ? (
            <button
              onClick={tts.pause}
              className='w-8 h-8 flex items-center justify-center rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-colors'
            >
              <Pause className='w-4 h-4 fill-current' />
            </button>
          ) : (
            <button
              onClick={() => tts.play(post)} // Truyền cả post vào
              className='w-8 h-8 flex items-center justify-center rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-colors pl-0.5'
            >
              <Play className='w-4 h-4 fill-current' />
            </button>
          )}
          {(tts.isPlaying || tts.isPaused) && (
            <button
              onClick={tts.stop}
              className='w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors'
            >
              <Square className='w-3.5 h-3.5 fill-current' />
            </button>
          )}
        </div>

        {/* Visualizer */}
        <div className='flex items-center gap-0.5 h-6 mx-2 shrink-0'>
          {[60, 100, 40, 80, 50].map((height, idx) => (
            <div
              key={idx}
              className={`w-1 bg-brand-green/40 rounded-full transition-all duration-300 ${
                tts.isPlaying ? 'animate-pulse' : 'h-1'
              }`}
              style={{
                height: tts.isPlaying ? `${height}%` : '4px',
                animationDelay: `${idx * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Tốc độ & Giọng đọc */}
        <div className='flex items-center gap-2 shrink-0'>
          <select
            className='h-9 text-[13px] font-medium border border-slate-200 bg-white rounded-lg px-2 outline-none focus:border-brand-green cursor-pointer'
            value={tts.rate}
            onChange={(e) => tts.setRate(Number(e.target.value))}
          >
            <option value={0.85}>0.85x</option>
            <option value={1}>1.00x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.50x</option>
          </select>

          <div className='relative flex items-center'>
            <Volume2 className='w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none' />
            <select
              className='h-9 text-[13px] font-medium border border-slate-200 bg-white rounded-lg pl-8 pr-2 outline-none focus:border-brand-green cursor-pointer w-[160px] truncate'
              value={tts.selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = tts.voices.find((v) => v.name === e.target.value)
                if (voice) tts.setSelectedVoice(voice)
              }}
            >
              {tts.voices.length > 0 ? (
                tts.voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {formatVoiceName(v)}
                  </option>
                ))
              ) : (
                <option>Đang tải giọng...</option>
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 3. Page Chính: Blog Detail ────────────────────────────────────────────────

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: post,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['news-detail', slug],
    queryFn: () => getPublicNewsBySlugApi(slug!),
    enabled: !!slug
  })

  if (isLoading) {
    return (
      <div className='max-w-[800px] mx-auto w-full px-4 py-10 flex flex-col gap-6 animate-pulse'>
        <div className='h-8 bg-slate-200 rounded w-3/4' />
        <div className='h-4 bg-slate-200 rounded w-1/4' />
        <div className='h-96 bg-slate-200 rounded-2xl w-full' />
        <div className='space-y-3 mt-6'>
          <div className='h-4 bg-slate-200 rounded w-full' />
          <div className='h-4 bg-slate-200 rounded w-full' />
          <div className='h-4 bg-slate-200 rounded w-5/6' />
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className='flex flex-col items-center justify-center py-32 text-center'>
        <h2 className='text-2xl font-bold text-slate-800 mb-2'>Bài viết không tồn tại</h2>
        <p className='text-slate-500 mb-6'>Có thể bài viết đã bị xóa hoặc đường dẫn không đúng.</p>
        <Link to='/blog' className='px-6 py-2.5 bg-brand-green text-white rounded-xl font-medium'>
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <BreadcrumbHeader />

      <main className='flex-1 max-w-[800px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700 slide-in-from-bottom-4'>
        <Link
          to='/blog'
          className='inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-green hover:text-brand-green-dark mb-6 transition-colors bg-brand-green/5 px-3 py-1.5 rounded-full w-fit'
        >
          <ChevronLeft className='w-4 h-4' /> Trở về Blog
        </Link>

        <header className='mb-8'>
          <div className='flex items-center gap-2 mb-4'>
            <span className='px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 rounded-md'>
              {post.categoryName || 'Tin tức'}
            </span>
          </div>

          <h1 className='text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4'>
            {post.title}
          </h1>

          <p className='text-lg text-slate-600 font-medium leading-relaxed mb-6'>{post.summary}</p>

          <div className='flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500 font-medium'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1.5'>
                <Calendar className='w-4 h-4' />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className='flex items-center gap-1.5'>
                <Eye className='w-4 h-4' />
                {post.viewCount} lượt xem
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <button className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors'>
                <FaFacebook className='w-4 h-4' />
              </button>
              <button className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors'>
                <LinkIcon className='w-4 h-4' />
              </button>
            </div>
          </div>
        </header>

        {/* Thanh Audio Player */}
        <AudioPlayer post={post} />

        {post.thumbnail && (
          <figure className='mb-10'>
            <img
              src={post.thumbnail}
              alt={post.title}
              className='w-full rounded-2xl object-cover shadow-sm aspect-video sm:aspect-[21/9]'
            />
            <figcaption className='text-center text-[12px] text-slate-400 mt-3 italic'>
              Ảnh minh họa bài viết: {post.title}
            </figcaption>
          </figure>
        )}

        <article
          className='prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-brand-green prose-img:rounded-xl prose-img:mx-auto'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className='mt-12 pt-6 border-t border-slate-100'>
          <h4 className='text-sm font-bold text-slate-900 mb-3'>Chủ đề liên quan:</h4>
          <div className='flex flex-wrap gap-2'>
            {['Sách hay', 'Góc đọc sách', 'Kiến thức'].map((tag) => (
              <span
                key={tag}
                className='px-3 py-1.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg cursor-pointer hover:bg-slate-200 transition-colors'
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
