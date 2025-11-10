import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '게시판 웹사이트',
  description: '로그인 기능이 있는 게시판 웹사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}



